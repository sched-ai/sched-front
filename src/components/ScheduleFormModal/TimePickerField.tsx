import { TimePicker } from "antd";
import type { TimePickerProps } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

type DisabledTimeFactory = NonNullable<TimePickerProps["disabledTime"]>;

interface TimePickerFieldProps {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  minTime?: string;
  maxTime?: string;
  ariaLabel: string;
  disabledTime?: DisabledTimeFactory;
}

interface ParsedTime {
  hour: number;
  minute: number;
}

const parseTime = (time?: string): ParsedTime | null => {
  if (!time || !time.includes(":")) return null;

  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return { hour, minute };
};

const range = (start: number, end: number) => {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const uniqueSorted = (values: number[]) => Array.from(new Set(values)).sort((a, b) => a - b);

const mergeDisabledTime = (
  baseDisabledTime: DisabledTimeFactory | undefined,
  minTime?: string,
  maxTime?: string,
): DisabledTimeFactory => {
  return (now: Dayjs) => {
    const min = parseTime(minTime);
    const max = parseTime(maxTime);
    const base = baseDisabledTime?.(now) ?? {};

    const minHour = min?.hour;
    const maxHour = max?.hour;

    const disabledHoursFromRange = () => {
      if (typeof minHour !== "number" || typeof maxHour !== "number") return [];

      const blockedBelow = minHour > 0 ? range(0, minHour - 1) : [];
      const blockedAbove = maxHour < 23 ? range(maxHour + 1, 23) : [];
      return [...blockedBelow, ...blockedAbove];
    };

    const disabledMinutesFromRange = (hour: number) => {
      if (!min || !max) return [];

      if (hour < min.hour || hour > max.hour) {
        return range(0, 59);
      }

      if (min.hour === max.hour) {
        const blockedBelow = min.minute > 0 ? range(0, min.minute - 1) : [];
        const blockedAbove = max.minute < 59 ? range(max.minute + 1, 59) : [];
        return [...blockedBelow, ...blockedAbove];
      }

      if (hour === min.hour) {
        return min.minute > 0 ? range(0, min.minute - 1) : [];
      }

      if (hour === max.hour) {
        return max.minute < 59 ? range(max.minute + 1, 59) : [];
      }

      return [];
    };

    return {
      disabledHours: () => {
        const baseHours = base.disabledHours?.() ?? [];
        return uniqueSorted([...baseHours, ...disabledHoursFromRange()]);
      },
      disabledMinutes: (selectedHour: number) => {
        const baseMinutes = base.disabledMinutes?.(selectedHour) ?? [];
        return uniqueSorted([...baseMinutes, ...disabledMinutesFromRange(selectedHour)]);
      },
      disabledSeconds: (selectedHour: number, selectedMinute: number) => {
        const baseSeconds = base.disabledSeconds?.(selectedHour, selectedMinute) ?? [];
        return uniqueSorted(baseSeconds);
      },
    };
  };
};

const toDayjs = (time: string): Dayjs | null => {
  const parsed = parseTime(time);
  if (!parsed) return null;
  return dayjs().hour(parsed.hour).minute(parsed.minute).second(0).millisecond(0);
};

export const TimePickerField = ({
  id,
  value,
  onChange,
  minTime,
  maxTime,
  ariaLabel,
  disabledTime,
}: TimePickerFieldProps) => {
  const handleSyncValue = (selected: Dayjs | null) => {
    if (!selected) return;
    onChange(selected.format("HH:mm"));
  };

  return (
    <TimePicker
      id={id}
      value={toDayjs(value)}
      format="HH:mm"
      minuteStep={1}
      showNow={false}
      needConfirm={false}
      allowClear={false}
      inputReadOnly
      changeOnScroll
      hideDisabledOptions
      disabledTime={mergeDisabledTime(disabledTime, minTime, maxTime)}
  onSelect={handleSyncValue}
      onChange={(_: Dayjs | null, timeString: string | null) => onChange(timeString ?? "")}
      className="schedule-time-picker"
      popupClassName="schedule-time-picker-dropdown"
      aria-label={ariaLabel}
    />
  );
};
