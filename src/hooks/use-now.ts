import * as React from "react"

import { MINUTE } from "@/lib/time"

/** O instante atual, atualizado a cada virada de minuto e quando o app volta ao primeiro plano. */
export function useNow() {
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        setNow(Date.now())
        schedule()
      }, MINUTE - (Date.now() % MINUTE) + 50)
    }
    const onVisible = () => {
      if (document.visibilityState !== "visible") return
      clearTimeout(timer)
      setNow(Date.now())
      schedule()
    }
    schedule()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  return now
}
