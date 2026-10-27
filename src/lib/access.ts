import * as React from "react"

/**
 * O site fica atrás do login do Cloudflare Access (código no e-mail, sessão de 1 mês).
 * O app instalado abre pelo cache mesmo com a sessão vencida; só as versões novas deixam de chegar.
 * `entrar/` fica fora do cache do service worker: pedir ela mostra se a sessão ainda vale,
 * e abrir ela passa pelo login e volta pro app.
 */
export const LOGIN_URL = `${import.meta.env.BASE_URL}entrar/`

async function sessionExpired() {
  try {
    const res = await fetch(LOGIN_URL, { redirect: "manual", cache: "no-store" })
    return res.type === "opaqueredirect" || res.status === 401 || res.status === 403
  } catch {
    // Sem rede: não dá pra saber, e não adianta pedir login.
    return false
  }
}

export function useAccessExpired() {
  const [expired, setExpired] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    const check = async () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return
      const result = await sessionExpired()
      if (!cancelled) setExpired(result)
    }
    check()
    document.addEventListener("visibilitychange", check)
    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", check)
    }
  }, [])

  return expired
}
