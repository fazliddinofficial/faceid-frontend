export const DEFAULT_CHECK_IN_THRESHOLDS = [
  "08:00",
  "10:00",
  "14:00",
  "16:00",
  "18:00",
] as const;

export const ON_TIME_STATUS = "\u2705";
export const LATE_STATUS = "\u274C";

type CheckInValue = string | Date | null | undefined;

function getCheckInMinutes(checkInTime: CheckInValue) {
  if (!checkInTime) {
    return null;
  }

  const date = checkInTime instanceof Date ? checkInTime : new Date(checkInTime);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getHours() * 60 + date.getMinutes();
}

function parseThresholdMinutes(threshold: string) {
  const [hoursText, minutesText = "0"] = threshold.split(":");
  const hours = Number.parseInt(hoursText, 10);
  const minutes = Number.parseInt(minutesText, 10);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function matchesLateThreshold(
  checkInMinutes: number,
  thresholds: readonly string[],
) {
  return thresholds.some((threshold) => {
    const thresholdMinutes = parseThresholdMinutes(threshold);
    return thresholdMinutes !== null && checkInMinutes > thresholdMinutes;
  });
}

export function isLateCheckIn(
  checkInTime: CheckInValue,
  thresholds: readonly string[] = DEFAULT_CHECK_IN_THRESHOLDS,
) {
  const checkInMinutes = getCheckInMinutes(checkInTime);
  if (checkInMinutes === null) {
    return false;
  }

  return matchesLateThreshold(checkInMinutes, thresholds);
}

export function getCheckInStatus(
  checkInTime: CheckInValue,
  thresholds: readonly string[] = DEFAULT_CHECK_IN_THRESHOLDS,
) {
  const checkInMinutes = getCheckInMinutes(checkInTime);
  if (checkInMinutes === null) {
    return "";
  }

  return matchesLateThreshold(checkInMinutes, thresholds)
    ? LATE_STATUS
    : ON_TIME_STATUS;
}
