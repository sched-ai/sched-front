// ─── Slot Calculation Utilities ───────────────────────────────────────────────
// Pure functions for calculating time slots in the calendar grid.
// No React dependencies — designed for reuse by drag-to-resize/move features.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimeInterval {
  startMin: number; // minutes since 00:00 (0–1439)
  endMin: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MINUTES_IN_DAY = 24 * 60;
const DEFAULT_SLOT_DURATION = 60; // 1 hour
const MIN_SLOT_DURATION = 5;

// ─── Conversion helpers ───────────────────────────────────────────────────────

/** Convert "HH:MM" string to total minutes since 00:00 */
export function timeToMin(time: string): number {
  const [h = "0", m = "0"] = time.split(":");
  const total = Number(h) * 60 + Number(m);
  if (Number.isNaN(total)) return 0;
  return Math.max(0, Math.min(MINUTES_IN_DAY - 1, total));
}

/** Convert total minutes since 00:00 to "HH:MM" string */
export function minToTime(minutes: number): string {
  const safe = Math.max(0, Math.min(MINUTES_IN_DAY - 1, minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── Conflict detection ───────────────────────────────────────────────────────

/** Check if two intervals overlap (exclusive boundaries — touching is NOT overlap) */
function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return a.startMin < b.endMin && a.endMin > b.startMin;
}

/**
 * Check if a proposed interval conflicts with any obstacle.
 * Useful for future drag-to-resize validation.
 */
export function hasConflict(
  proposed: TimeInterval,
  obstacles: TimeInterval[],
): boolean {
  return obstacles.some((obs) => intervalsOverlap(proposed, obs));
}

// ─── Slot clamping ────────────────────────────────────────────────────────────

/**
 * Adjust a proposed interval so it fits within availability bounds
 * and does not collide with any obstacle.
 * Useful for future drag-to-move/resize.
 */
export function clampSlot(
  proposed: TimeInterval,
  obstacles: TimeInterval[],
  availStart: number,
  availEnd: number,
): TimeInterval {
  // Clamp to availability
  let start = Math.max(proposed.startMin, availStart);
  let end = Math.min(proposed.endMin, availEnd);

  if (end <= start) {
    end = Math.min(start + MIN_SLOT_DURATION, availEnd);
  }

  // Sort obstacles
  const sorted = [...obstacles].sort((a, b) => a.startMin - b.startMin);

  // If current position has conflict, try to push out
  for (const obs of sorted) {
    if (start < obs.endMin && end > obs.startMin) {
      // Overlap detected — try pushing after this obstacle
      start = obs.endMin;
      end = Math.max(end, start + MIN_SLOT_DURATION);
    }
  }

  // Re-clamp to availability
  start = Math.max(start, availStart);
  end = Math.min(end, availEnd);

  if (end <= start) {
    end = Math.min(start + MIN_SLOT_DURATION, availEnd);
  }

  return { startMin: start, endMin: end };
}

// ─── Smart slot finding ───────────────────────────────────────────────────────

/**
 * Given a clicked minute, the day's events, and availability bounds,
 * returns the best slot { startMin, endMin }.
 *
 * Rules:
 * 1. If clicked inside an existing event → position AFTER (or BEFORE if no room after)
 * 2. If clicked in free space → default 1h, truncated by next obstacle
 * 3. Never exceeds availability bounds
 * 4. Minimum duration: MIN_SLOT_DURATION (5min)
 */
export function findSmartSlot(
  clickedMin: number,
  dayEvents: TimeInterval[],
  availStart: number,
  availEnd: number,
  defaultDuration: number = DEFAULT_SLOT_DURATION,
): TimeInterval {
  // Sort events by start time
  const sorted = [...dayEvents].sort((a, b) => a.startMin - b.startMin);

  // Clamp clicked minute to availability
  const clampedClick = Math.max(Math.min(clickedMin, availEnd - 1), availStart);

  // ─── Case 1: Clicked inside an existing event ───────────────────────
  const overlapping = sorted.find(
    (ev) => clampedClick >= ev.startMin && clampedClick < ev.endMin,
  );

  if (overlapping) {
    // Try AFTER the event first
    const afterSlot = trySlotAfter(overlapping.endMin, sorted, availStart, availEnd, defaultDuration);
    if (afterSlot) return afterSlot;

    // Fall back to BEFORE the event
    const beforeSlot = trySlotBefore(overlapping.startMin, sorted, availStart, availEnd, defaultDuration);
    if (beforeSlot) return beforeSlot;

    // Last resort: minimal slot right after the event (even if squeezed)
    const fallbackEnd = Math.min(overlapping.endMin + MIN_SLOT_DURATION, availEnd);
    if (fallbackEnd > overlapping.endMin) {
      return { startMin: overlapping.endMin, endMin: fallbackEnd };
    }

    // Absolute fallback: minimal slot at the very end of availability
    return {
      startMin: Math.max(availEnd - MIN_SLOT_DURATION, availStart),
      endMin: availEnd,
    };
  }

  // ─── Case 2: Clicked in free space ─────────────────────────────────
  return buildFreeSlot(clampedClick, sorted, availStart, availEnd, defaultDuration);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Try to place a slot starting at `fromMin`, respecting obstacles and bounds.
 * Returns null if no valid slot can be placed.
 */
function trySlotAfter(
  fromMin: number,
  sortedEvents: TimeInterval[],
  availStart: number,
  availEnd: number,
  duration: number,
): TimeInterval | null {
  if (fromMin >= availEnd) return null;

  const start = Math.max(fromMin, availStart);

  // Find next obstacle after start
  const nextObstacle = sortedEvents.find((ev) => ev.startMin > start);
  const ceiling = Math.min(nextObstacle?.startMin ?? availEnd, availEnd);

  // Available gap
  const gap = ceiling - start;
  if (gap < MIN_SLOT_DURATION) return null;

  const end = Math.min(start + duration, ceiling);
  return { startMin: start, endMin: end };
}

/**
 * Try to place a slot ending at `untilMin`, respecting obstacles and bounds.
 * Returns null if no valid slot can be placed.
 */
function trySlotBefore(
  untilMin: number,
  sortedEvents: TimeInterval[],
  availStart: number,
  availEnd: number,
  duration: number,
): TimeInterval | null {
  if (untilMin <= availStart) return null;

  const end = Math.min(untilMin, availEnd);

  // Find the closest obstacle before end
  const prevObstacle = [...sortedEvents]
    .reverse()
    .find((ev) => ev.endMin <= end);
  const floor = Math.max(prevObstacle?.endMin ?? availStart, availStart);

  // Available gap
  const gap = end - floor;
  if (gap < MIN_SLOT_DURATION) return null;

  const start = Math.max(end - duration, floor);
  return { startMin: start, endMin: end };
}

/**
 * Build a slot in free space starting at clickedMin.
 * Truncates to the next obstacle or availability end.
 */
function buildFreeSlot(
  clickedMin: number,
  sortedEvents: TimeInterval[],
  availStart: number,
  availEnd: number,
  duration: number,
): TimeInterval {
  const start = Math.max(clickedMin, availStart);

  // Find next obstacle
  const nextObstacle = sortedEvents.find((ev) => ev.startMin > start);
  const ceiling = Math.min(nextObstacle?.startMin ?? availEnd, availEnd);

  // Calculate end, respecting ceiling
  const end = Math.min(start + duration, ceiling);

  // Ensure minimum duration
  if (end - start < MIN_SLOT_DURATION) {
    // Not enough room forward — try to expand backward
    const expandedStart = Math.max(end - MIN_SLOT_DURATION, availStart);
    return { startMin: expandedStart, endMin: end };
  }

  return { startMin: start, endMin: end };
}
