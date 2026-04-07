export function getLocalDateInputValue(date = new Date()) {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
}

export function getStartOfDayParam(date: string) {
  return `${date}T00:00:00`;
}

export function getEndOfDayParam(date: string) {
  return `${date}T23:59:59.999`;
}
