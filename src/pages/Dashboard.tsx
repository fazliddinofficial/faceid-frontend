import { type ChangeEvent, useEffect, useState } from 'react';
import {
  getEmployees,
  getSummary,
  type DailySummary,
  type Employee,
  type TodaySummaryEmployee,
} from '../api';
import { getLocalDateInputValue } from '../utils/date';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        padding: '24px',
        minWidth: '160px',
        flex: 1,
      }}
    >
      <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 600, color: '#111' }}>{value}</div>
    </div>
  );
}

function formatTime(iso: string | null) {
  if (!iso) return '--';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(totalWorkedMinutes: number) {
  if (totalWorkedMinutes <= 0) return '--';

  const hours = Math.floor(totalWorkedMinutes / 60);
  const minutes = totalWorkedMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Failed to load dashboard data.';
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [date, setDate] = useState(() => getLocalDateInputValue());

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const nextSummary = await getSummary(date);
        if (cancelled) return;

        setSummary(nextSummary);
        setSummaryError(null);
      } catch (error) {
        if (cancelled) return;

        setSummary(null);
        setSummaryError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [date]);

  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      try {
        const nextEmployees = await getEmployees();
        if (cancelled) return;

        setEmployees(nextEmployees.filter((employee) => employee.isActive));
        setEmployeesError(null);
      } catch (error) {
        if (cancelled) return;

        setEmployees([]);
        setEmployeesError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setEmployeesLoading(false);
        }
      }
    }

    void loadEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleDateChange(event: ChangeEvent<HTMLInputElement>) {
    setDate(event.target.value);
    setSummaryLoading(true);
    setSummaryError(null);
  }

  const checkedIn = summary?.employees.filter((employee) => employee.checkIn).length ?? 0;
  const checkedOut = summary?.employees.filter((employee) => employee.checkOut).length ?? 0;
  const total = employees.length;
  const notYetIn = Math.max(total - checkedIn, 0);
  const loading = summaryLoading || employeesLoading;
  const error = summaryError ?? employeesError;
  const summaryEmployees = summary?.employees ?? [];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#111' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
            {summary?.date ?? date}
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          style={{
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            color: '#111',
            background: '#fff',
            cursor: 'pointer',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <StatCard label="Total employees" value={employeesLoading ? '...' : total} />
        <StatCard label="Checked in" value={summaryLoading ? '...' : checkedIn} />
        <StatCard label="Checked out" value={summaryLoading ? '...' : checkedOut} />
        <StatCard label="Not yet in" value={loading ? '...' : notYetIn} />
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e5e5' }}>
          <span style={{ fontWeight: 500, fontSize: '15px', color: '#111' }}>Today's summary</span>
        </div>

        {error ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#b91c1c', fontSize: '14px' }}>
            {error}
          </div>
        ) : loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            Loading...
          </div>
        ) : summaryEmployees.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            No scans recorded for this date
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Employee No', 'Name', 'Check In', 'Check Out', 'Total Hours', 'Total Scans'].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#888',
                      borderBottom: '1px solid #e5e5e5',
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaryEmployees.map((employee: TodaySummaryEmployee, index: number) => (
                <tr
                  key={employee.employeeNo}
                  style={{ background: index % 2 === 0 ? '#fff' : '#fafafa' }}
                >
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#888' }}>
                    {employee.employeeNo}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111', fontWeight: 500 }}>
                    {employee.name}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#111' }}>
                    {formatTime(employee.checkIn)}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#111' }}>
                    {formatTime(employee.checkOut)}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#111' }}>
                    {formatDuration(employee.totalWorkedMinutes)}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#111' }}>
                    {employee.totalScans}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
