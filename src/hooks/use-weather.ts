import * as React from "react"

import type { Person } from "@/data/types"

export interface Weather {
  temperature: number
  code: number
  isDay: boolean
}

const REFRESH = 30 * 60_000

/** Clima atual pela Open-Meteo (gratuita, sem chave). */
export function useWeather(person: Person) {
  const [weather, setWeather] = React.useState<Weather | null>(null)
  const [failed, setFailed] = React.useState(false)
  const { latitude, longitude } = person

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day`
        const res = await fetch(url)
        if (!res.ok) throw new Error(String(res.status))
        const { current } = await res.json()
        if (cancelled) return
        setWeather({ temperature: current.temperature_2m, code: current.weather_code, isDay: current.is_day === 1 })
        setFailed(false)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }
    load()
    const id = setInterval(load, REFRESH)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [latitude, longitude])

  return { weather, failed }
}
