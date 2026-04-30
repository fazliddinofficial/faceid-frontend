import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:3000';

const api = axios.create({
  baseURL: apiBaseUrl,
});

export interface AttendanceRecord {
  _id: string;
  employeeNo: string;
  name: string;
  scanTime: string;
  verifyMode: string;
  doorNo: number;
  attendanceType: 'check-in' | 'check-out';
}

export interface Employee {
  _id: string;
  employeeNo: string;
  name: string;
  verifyMode: string;
  isActive: boolean;
  createdAt: string;
  descriptor: number[]
}

export type CourseDay =
  | 'dushanba'
  | 'seshanba'
  | 'chorshanba'
  | 'payshanba'
  | 'juma'
  | 'shanba'
  | 'odd'
  | 'even'
  | 'all'
  ;

export interface Course {
  _id: string;
  courseName: string;
  day: string;
  startTime: string | undefined;
  endTime: string | undefined;
  teacher: Employee;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoursePayload {
  courseName: string;
  startTime: Date;
  endTime?: Date;
  teacher: string;
  day: CourseDay;
}

export interface TodaySummaryEmployee {
  employeeNo: string;
  name: string;
  checkIn: string | null;
  checkOut: string | null;
  totalScans: number;
  totalWorkedMinutes: number;
  hasScheduledClass: boolean;
  scheduledStartTime: string | null;
  classAttendanceStatus: 'on-time' | 'late' | null;
  lateMinutes: number;
  totalLateMinutes: number;
}

export interface DailySummary {
  date: string;
  totalEmployees: number;
  employees: TodaySummaryEmployee[];
}

export interface TodayAttendance {
  date: string;
  total: number;
  records: AttendanceRecord[];
}

export interface RangeAttendance {
  startDate: string;
  endDate: string;
  total: number;
  records: AttendanceRecord[];
}

interface AttendanceResult {
  isLate: boolean;
  minutesLate: number;
  arrivedAt: Date;
  status: "on_time" | "late" | "missed";
  message?: string;
}

export const getToday = () =>
  api.get<TodayAttendance>('/attendance/today').then((response) => response.data);

export const getSummary = (date?: string) =>
  api
    .get<DailySummary>('/attendance/summary', { params: { date } })
    .then((response) => response.data);

export const getRange = (startDate: string, endDate: string) =>
  api
    .get<RangeAttendance>('/attendance/range', { params: { startDate, endDate } })
    .then((response) => response.data);

export const getCourses = () =>
  api.get<Course[]>('/courses').then((response) => response.data);

export const getEmployeeAttendance = (employeeNo: string, page = 1, limit = 20) =>
  api
    .get(`/attendance/employee/${employeeNo}`, { params: { page, limit } })
    .then((response) => response.data);

export const getEmployees = () =>
  api.get<Employee[]>('/employees/all').then((response) => response.data);

export const getEmployeeByNum = (employeeNo: string) =>
  api.get<Employee>(`/employees/${employeeNo}`).then((response) => response.data);

export const createCourse = (payload: CreateCoursePayload) =>
  api.post<{ status: number }>('/courses', payload).then((response) => response.data);

export const getAllCourses = () =>
  api.get<Course[]>('/courses',).then((response) => response.data);

export const deleteCourseById = (id: string) => api.delete(`/courses/${id}`);

export const addFaceDetection = (data: { des: number[], employeeNo: string }) =>
  api.post('/employees/add/face', data).then((response) => response.data);

export const checkAttendanceByFace = (eNum: string) =>
  api.post<AttendanceResult>('/attendance/check/face', { eNum }).then((response) => response.data);