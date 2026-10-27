/**
 * Onde o cofre criptografado mora: um repositório privado só dele, separado do código do site.
 * Assim salvar um recado não republica o site, e a chave do cofre não consegue mexer no app.
 */
export const REPO = {
  owner: "marcelcorradi",
  name: "sayang-cofre",
  branch: "main",
  path: "vault.json",
}

export type StorageErrorCode = "bad-token" | "forbidden" | "conflict" | "network"

export class StorageError extends Error {
  code: StorageErrorCode
  constructor(code: StorageErrorCode) {
    super(code)
    this.code = code
  }
}

export interface Stored {
  text: string
  sha: string | null
}

export interface VaultStorage {
  read(): Promise<Stored | null>
  write(text: string, sha: string | null): Promise<string | null>
}

const API = "https://api.github.com"

export function githubStorage(token: string): VaultStorage {
  const base = `${API}/repos/${REPO.owner}/${REPO.name}`

  async function request(path: string, init: RequestInit = {}) {
    let res: Response
    try {
      res = await fetch(`${base}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          ...(init.body ? { "Content-Type": "application/json" } : {}),
        },
      })
    } catch {
      throw new StorageError("network")
    }
    if (res.status === 401) throw new StorageError("bad-token")
    if (res.status === 403) throw new StorageError("forbidden")
    if (res.status === 409) throw new StorageError("conflict")
    return res
  }

  async function ensureBranch() {
    const existing = await request(`/git/ref/heads/${REPO.branch}`)
    if (existing.ok) return
    const repo = await (await request("")).json()
    const head = await request(`/git/ref/heads/${repo.default_branch}`)
    if (!head.ok) throw new StorageError("forbidden")
    const { object } = await head.json()
    const created = await request("/git/refs", {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${REPO.branch}`, sha: object.sha }),
    })
    if (!created.ok && created.status !== 422) throw new StorageError("forbidden")
  }

  return {
    async read() {
      const res = await request(`/contents/${REPO.path}?ref=${REPO.branch}`)
      if (res.status === 404) {
        // Sem branch ou sem arquivo: confere se a chave ao menos enxerga o repositório.
        const repo = await request("")
        if (!repo.ok) throw new StorageError("forbidden")
        return null
      }
      if (!res.ok) throw new StorageError("network")
      const body = await res.json()
      return { text: atob(String(body.content).replace(/\n/g, "")), sha: body.sha }
    },

    async write(text, sha) {
      const put = () =>
        request(`/contents/${REPO.path}`, {
          method: "PUT",
          body: JSON.stringify({
            message: "cofre: atualização",
            content: btoa(text),
            branch: REPO.branch,
            ...(sha ? { sha } : {}),
          }),
        })
      let res = await put()
      if (res.status === 404) {
        await ensureBranch()
        res = await put()
      }
      if (res.status === 422) throw new StorageError("conflict")
      if (!res.ok) throw new StorageError("network")
      const body = await res.json()
      return body.content.sha
    },
  }
}

/** Só em desenvolvimento (VITE_VAULT_LOCAL=1): guarda o cofre no navegador para testar sem GitHub. */
export function localStorageBackend(): VaultStorage {
  const key = "sayang:dev-vault"
  return {
    async read() {
      const text = localStorage.getItem(key)
      return text ? { text, sha: String(text.length) } : null
    },
    async write(text) {
      localStorage.setItem(key, text)
      return String(text.length)
    },
  }
}
