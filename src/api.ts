import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// ── Types ──────────────────────────────────────────────────────────────────────

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
}

export interface TodaySummaryEmployee {
  employeeNo: string;
  name: string;
  checkIn: string | null;
  checkOut: string | null;
  totalScans: number;
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

// ── API calls ──────────────────────────────────────────────────────────────────

export const getToday = () =>
  api.get<TodayAttendance>('/attendance/today').then(r => r.data);

export const getSummary = (date?: string) =>
  api.get<DailySummary>('/attendance/summary', { params: { date } }).then(r => r.data);

export const getRange = (startDate: string, endDate: string) =>
  api.get<RangeAttendance>('/attendance/range', { params: { startDate, endDate } }).then(r => r.data);

export const getEmployeeAttendance = (employeeNo: string, page = 1, limit = 20) =>
  api.get(`/attendance/employee/${employeeNo}`, { params: { page, limit } }).then(r => r.data);

export const getEmployees = () =>
  api.get<Employee[]>('/employees').then(r => r.data);