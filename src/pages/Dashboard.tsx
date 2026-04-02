import { useEffect, useState } from 'react'; 
import { getSummary, type DailySummary, type TodaySummaryEmployee } from '../api';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '24px',
      minWidth: '160px',
      flex: 1,
    }}>
      <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 600, color: '#111' }}>{value}</div>
    </div>
  );
}

function Badge({ type }: { type: 'check-in' | 'check-out' | null }) {
  if (!type) return <span style={{ color: '#ccc', fontSize: '13px' }}>—</span>;
  return (
    <span style={{
      fontSize: '12px',
      padding: '2px 10px',
      borderRadius: '999px',
      background: type === 'check-in' ? '#f0fdf4' : '#fafafa',
      color: type === 'check-in' ? '#16a34a' : '#888',
      border: `1px solid ${type === 'check-in' ? '#bbf7d0' : '#e5e5e5'}`,
    }}>
      {type}
    </span>
  );
}

function formatTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setLoading(true);
    getSummary(date)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [date]);

  const checkedIn = summary?.employees.filter(e => e.checkIn).length ?? 0;
  const checkedOut = summary?.employees.filter(e => e.checkOut).length ?? 0;
  const total = summary?.totalEmployees ?? 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#111' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
            {summary?.date ?? '...'}
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
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

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <StatCard label="Total employees" value={total} />
        <StatCard label="Checked in" value={checkedIn} />
        <StatCard label="Checked out" value={checkedOut} />
        <StatCard label="Not yet in" value={total - checkedIn} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e5e5' }}>
          <span style={{ fontWeight: 500, fontSize: '15px', color: '#111' }}>Today's summary</span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontSize: '14px' }}>Loading...</div>
        ) : summary?.employees.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            No scans recorded for this date
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Employee No', 'Name', 'Check In', 'Check Out', 'Total Scans'].map(h => (
                  <th key={h} style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#888',
                    borderBottom: '1px solid #e5e5e5',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary?.employees.map((emp: TodaySummaryEmployee, i: number) => (
                <tr key={emp.employeeNo} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#888' }}>{emp.employeeNo}</td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111', fontWeight: 500 }}>{emp.name}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#111' }}>{formatTime(emp.checkIn)}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#111' }}>{formatTime(emp.checkOut)}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <Badge type={emp.checkIn ? (emp.checkOut ? 'check-out' : 'check-in') : null} />
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