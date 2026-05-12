const BUSINESS_TIMEZONE = "America/Sao_Paulo"
const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || BUSINESS_TIMEZONE

const BUSINESS_NUMERIC_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  timeZone: BUSINESS_TIMEZONE,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

const BUSINESS_DISPLAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: BUSINESS_TIMEZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const BUSINESS_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIMEZONE,
  weekday: "short",
})

const USER_NUMERIC_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  timeZone: USER_TIMEZONE,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

const USER_DISPLAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: USER_TIMEZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const USER_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: USER_TIMEZONE,
  weekday: "short",
})

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

const toPartsMap = (formatter: Intl.DateTimeFormat, date: Date) => {
  return Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]))
}

// const hasExplicitTimezone = (value: string) => {
//   return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)
// }

export type BusinessDateTimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  dayIdx: number
}

export type BusinessDisplayParts = {
  day: string
  month: string
  monthShort: string
  year: string
  time: string
}

export type UserDateTimeParts = BusinessDateTimeParts
export type UserDisplayParts = BusinessDisplayParts

export type DayAvailability = {
  startMinute: number | null
  endMinute: number | null
}

export type WeeklyAvailability = Record<string, DayAvailability>

export const getBusinessDateTimeParts = (value: string | Date): BusinessDateTimeParts | null => {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return null

  const parts = toPartsMap(BUSINESS_NUMERIC_FORMATTER, date)
  const weekday = BUSINESS_WEEKDAY_FORMATTER.format(date)
  const dayIdx = WEEKDAY_INDEX[weekday]

  if (dayIdx === undefined) return null

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    dayIdx,
  }
}

export const getBusinessDisplayParts = (value: string | Date): BusinessDisplayParts | null => {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return null

  const parts = toPartsMap(BUSINESS_DISPLAY_FORMATTER, date)
  const day = String(parts.day || "")
  const month = String(parts.month || "")
  const year = String(parts.year || "")
  const hour = String(parts.hour || "")
  const minute = String(parts.minute || "")
  const monthShort = month.toUpperCase().replace(".", "")

  return {
    day,
    month,
    monthShort,
    year,
    time: `${hour}:${minute}`,
  }
}

export const getUserDateTimeParts = (value: string | Date): UserDateTimeParts | null => {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return null

  const parts = toPartsMap(USER_NUMERIC_FORMATTER, date)
  const weekday = USER_WEEKDAY_FORMATTER.format(date)
  const dayIdx = WEEKDAY_INDEX[weekday]

  if (dayIdx === undefined) return null

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    dayIdx,
  }
}

export const getUserDisplayParts = (value: string | Date): UserDisplayParts | null => {
  if (!value) return null

  // Adhere to UTC-as-local convention: if we have an ISO string, extract the wall-clock parts directly
  if (typeof value === "string") {
    const raw = value.trim()
    const localDateTimeMatch = raw.match(
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/
    )

    if (localDateTimeMatch) {
      const [, yearStr, monthStr, dayStr, hourStr, minuteStr] = localDateTimeMatch
      const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
      const monthNum = parseInt(monthStr, 10)
      const monthShort = monthNames[monthNum - 1]

      return {
        day: dayStr,
        month: monthStr,
        monthShort,
        year: yearStr,
        time: `${hourStr}:${minuteStr}`,
      }
    }
  }

  // Fallback for Date objects
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const parts = toPartsMap(USER_DISPLAY_FORMATTER, date)
  const day = String(parts.day || "")
  const month = String(parts.month || "")
  const year = String(parts.year || "")
  const hour = String(parts.hour || "")
  const minute = String(parts.minute || "")
  const monthShort = month.toUpperCase().replace(".", "")

  return {
    day,
    month,
    monthShort,
    year,
    time: `${hour}:${minute}`,
  }
}

export const formatBusinessHour = (value: string | null | undefined, emptyLabel = "Sem horário") => {
  if (!value) return emptyLabel

  const raw = String(value).trim()
  if (!raw) return emptyLabel

  // Preserve local wall-clock values when backend sends datetime without timezone,
  // or with timezone (UTC-as-local convention).
  const localDateTimeMatch = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/
  )

  if (localDateTimeMatch) {
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

export const formatUserHour = (value: string | Date | null | undefined, emptyLabel = "Sem horário") => {
  if (!value) return emptyLabel

  const raw = String(value).trim()
  if (!raw) return emptyLabel

  // Preserve local wall-clock values when backend sends datetime without timezone,
  // or with timezone (UTC-as-local convention).
  const localDateTimeMatch = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/
  )

  if (localDateTimeMatch && typeof value === 'string') {
    const [, , , , hour, minute] = localDateTimeMatch
    return `${hour}:${minute}`
  }

  const parsed = value instanceof Date ? value : new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: USER_TIMEZONE,
    })
  }

  const directHourMatch = raw.match(/^(\d{2}):(\d{2})/)
  if (directHourMatch) {
    return `${directHourMatch[1]}:${directHourMatch[2]}`
  }

  return raw
}

export const getUserDayAvailability = (
  date: Date,
  businessAvailability?: WeeklyAvailability
): DayAvailability | null => {
  if (!businessAvailability) return null

  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  let first: number | null = null
  let last: number | null = null

  for (let minute = 0; minute < 24 * 60; minute += 1) {
    const instant = new Date(dayStart.getTime() + minute * 60000)
    const parts = getBusinessDateTimeParts(instant)
    if (!parts) continue

    const dayData = businessAvailability[String(parts.dayIdx)]
    if (!dayData || dayData.startMinute === null || dayData.endMinute === null) continue

    const businessMinute = parts.hour * 60 + parts.minute
    if (businessMinute >= dayData.startMinute && businessMinute < dayData.endMinute) {
      if (first === null) first = minute
      last = minute
    }
  }

  if (first === null || last === null) return null

  return {
    startMinute: first,
    endMinute: Math.min(last + 1, 24 * 60),
  }
}

export const getUserTimeZone = () => USER_TIMEZONE
