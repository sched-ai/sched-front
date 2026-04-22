const BUSINESS_TIMEZONE = "America/Sao_Paulo"

const hasExplicitTimezone = (value: string) => {
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)
}

export const formatBusinessHour = (value: string | null | undefined, emptyLabel = "Sem horário") => {
  if (!value) return emptyLabel

  const raw = String(value).trim()
  if (!raw) return emptyLabel

  // Preserve local wall-clock values when backend sends datetime without timezone.
  const localDateTimeMatch = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?$/
  )

  if (localDateTimeMatch && !hasExplicitTimezone(raw)) {
    const [, , , , hour, minute] = localDateTimeMatch
    return `${hour}:${minute}`
  }

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: BUSINESS_TIMEZONE,
    })
  }

  const directHourMatch = raw.match(/^(\d{2}):(\d{2})/)
  if (directHourMatch) {
    return `${directHourMatch[1]}:${directHourMatch[2]}`
  }

  return raw
}
