import { type Course, type TodaySummaryEmployee } from "../api";

// Day mapping: 0=Sunday, 1=Monday, ... 6=Saturday
const DAY_NAMES = ['shanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'odd', 'even', 'all'];

export function getDayName(date: string): string {
  const d = new Date(date);
  return DAY_NAMES[d.getDay()];
}

export function timeToMinutes(timeString: string): number {
  // Handle both "HH:mm" format and ISO date format
  let timeOnly = timeString;

  // If it's an ISO datetime string, extract the time part
  if (timeString.includes('T')) {
    timeOnly = timeString.split('T')[1].substring(0, 5); // "HH:mm"
  }

  const [hours, minutes] = timeOnly.split(':').map(Number);
  return hours * 60 + minutes;
}

export function calculateAttendanceStatus(
  employee: TodaySummaryEmployee,
  courses: Course[],
  date: string
): { status: 'on-time' | 'late' | null; scheduledTimes: string[] } {
  if (!employee.checkIn) {
    return { status: null, scheduledTimes: [] };
  }

  const dayName = getDayName(date);

  // Find all courses scheduled for this day
  const scheduledCourses = courses.filter(
    course => course.day.toLowerCase() === dayName.toLowerCase()
  );

  if (scheduledCourses.length === 0) {
    return { status: null, scheduledTimes: [] };
  }

  const checkInTime = employee.checkIn.split('T')[1].substring(0, 5);
  const checkInMinutes = timeToMinutes(checkInTime);

  // Build array of scheduled times (formatted as HH:mm strings)
  const scheduledTimes = scheduledCourses
    .filter(course => course.startTime)
    .map(course => {
      const startTime = course.startTime!;
      const formatted = startTime.includes('T')
        ? startTime.split('T')[1].substring(0, 5)
        : startTime;
      return formatted;
    });

  // Check if employee is late: late if check-in is after ANY scheduled start time
  const isLate = scheduledTimes.some(startTime => {
    const startMinutes = timeToMinutes(startTime);
    const isLateForThis = checkInMinutes > startMinutes;
    return isLateForThis;
  });

  const status = isLate ? 'late' : 'on-time';

  return {
    status,
    scheduledTimes,
  };
}
