import { useEffect, useState } from 'react';
import { getRange, type AttendanceRecord } from '../api';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

function Badge({ type }: { type: 'check-in' | 'check-out' }) {
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

function VerifyBadge({ mode }: { mode: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    face:        { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    fingerprint: { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
    card:        { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
    pin:         { bg: '#fafafa', color: '#888',    border: '#e5e5e5' },
  };
  const c = colors[mode] ?? colors.pin;
  return (
    <span style={{
      fontSize: '12px',
      padding: '2px 10px',
      borderRadius: '999px',
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
    }}>
      {mode}
    </span>
  );
}

export default function AttendanceList() {
  const today = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate]     = useState(today);
  const [search, setSearch]       = useState('');
  const [records, setRecords]     = useState<AttendanceRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);

  useEffect(() => {
    setLoading(true);
    getRange(startDate, `${endDate}T23:59:59`)
      .then(data => {
        setRecords(data.records);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  // Filter by name or employeeNo on the frontend
  const filtered = records.filter(r =>
    search === '' ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.employeeNo.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#111' }}>Attendance</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
          {total} records found
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        padding: '16px 24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#888' }}>From</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#111',
              background: '#fff',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#888' }}>To</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#111',
              background: '#fff',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '12px', color: '#888' }}>Search</label>
          <input
            type="text"
            placeholder="Name or employee ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#111',
              background: '#fff',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            No records found
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Employee No', 'Name', 'Date', 'Time', 'Type', 'Verify mode'].map(h => (
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
              {filtered.map((r, i) => (
                <tr
                  key={r._id}
                  style={{
                    background: i % 2 === 0 ? '#fff' : '#fafafa',
                    transition: 'background 0.1s',
                  }}
                >
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#888' }}>{r.employeeNo}</td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111', fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#888' }}>{formatDate(r.scanTime)}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#111' }}>{formatTime(r.scanTime)}</td>
                  <td style={{ padding: '14px 24px' }}><Badge type={r.attendanceType} /></td>
                  <td style={{ padding: '14px 24px' }}><VerifyBadge mode={r.verifyMode} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}