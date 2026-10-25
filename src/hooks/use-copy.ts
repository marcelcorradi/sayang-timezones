import * as React from "react"

/** Copia texto e lembra por 2s que copiou, para o botão mostrar "copiado". */
export function useCopy() {
  const [copied, setCopied] = React.useState<string | null>(null)
  const copy = React.useCallback(async (text: string, id = text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      window.prompt("", text)
    }
    setCopied(id)
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000)
  }, [])
  return { copied, copy }
}
