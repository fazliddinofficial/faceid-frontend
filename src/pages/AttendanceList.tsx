import { type ChangeEvent, useEffect, useState } from 'react';
import { getRange, type AttendanceRecord } from '../api';
import { getEndOfDayParam, getLocalDateInputValue, getStartOfDayParam } from '../utils/date';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function Badge({ type }: { type: 'check-in' | 'check-out' }) {
  return (
    <span
      style={{
        fontSize: '12px',
        padding: '2px 10px',
        borderRadius: '999px',
        background: type === 'check-in' ? '#f0fdf4' : '#fafafa',
        color: type === 'check-in' ? '#16a34a' : '#888',
        border: `1px solid ${type === 'check-in' ? '#bbf7d0' : '#e5e5e5'}`,
      }}
    >
      {type}
    </span>
  );
}

function VerifyBadge({ mode }: { mode: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    face: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    fingerprint: { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
    card: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
    pin: { bg: '#fafafa', color: '#888', border: '#e5e5e5' },
  };
  const color = colors[mode] ?? colors.pin;

  return (
    <span
      style={{
        fontSize: '12px',
        padding: '2px 10px',
        borderRadius: '999px',
        background: color.bg,
        color: color.color,
        border: `1px solid ${color.border}`,
      }}
    >
      {mode}
    </span>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Failed to load attendance records.';
}

export default function AttendanceList() {
  const now = new Date();
  const today = getLocalDateInputValue(now);
  const defaultStartDate = getLocalDateInputValue(
    new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
  );

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(today);
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      try {
        const data = await getRange(getStartOfDayParam(startDate), getEndOfDayParam(endDate));
        if (cancelled) return;

        setRecords(data.records);
        setTotal(data.total);
        setError(null);
      } catch (error) {
        if (cancelled) return;

        setRecords([]);
        setTotal(0);
        setError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  function handleStartDateChange(event: ChangeEvent<HTMLInputElement>) {
    setStartDate(event.target.value);
    setLoading(true);
    setError(null);
  }

  function handleEndDateChange(event: ChangeEvent<HTMLInputElement>) {
    setEndDate(event.target.value);
    setLoading(true);
    setError(null);
  }

  const filtered = records.filter((record) => {
    if (search === '') return true;

    const normalizedSearch = search.toLowerCase();
    return (
      record.name.toLowerCase().includes(normalizedSearch) ||
      record.employeeNo.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#111' }}>Attendance</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>{total} records found</p>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#888' }}>From</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
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
            onChange={handleEndDateChange}
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
            onChange={(event) => setSearch(event.target.value)}
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

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {error ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#b91c1c', fontSize: '14px' }}>
            {error}
          </div>
        ) : loading ? (
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
                {['Employee No', 'Name', 'Date', 'Time', 'Type', 'Verify mode'].map((heading) => (
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
              {filtered.map((record, index) => (
                <tr
                  key={record._id}
                  style={{
                    background: index % 2 === 0 ? '#fff' : '#fafafa',
                    transition: 'background 0.1s',
                  }}
                >
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#888' }}>
                    {record.employeeNo}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111', fontWeight: 500 }}>
                    {record.name}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#888' }}>
                    {formatDate(record.scanTime)}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#111' }}>
                    {formatTime(record.scanTime)}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <Badge type={record.attendanceType} />
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <VerifyBadge mode={record.verifyMode} />
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
