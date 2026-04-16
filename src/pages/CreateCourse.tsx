import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import {
  createCourse,
  getEmployees,
  type CourseDay,
  type CreateCoursePayload,
  type Employee,
} from '../api';
import './CreateCourse.css';

const dayOptions: Array<{ value: CourseDay; label: string }> = [
  { value: 'dushanba', label: 'Dushanba' },
  { value: 'seshanba', label: 'Seshanba' },
  { value: 'chorshanba', label: 'Chorshanba' },
  { value: 'payshanba', label: 'Payshanba' },
  { value: 'juma', label: 'Juma' },
  { value: 'shanba', label: 'Shanba' },
];

const hourOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, '0')}:00`;
  return { value, label: value };
});

interface CreateCourseFormState {
  courseName: string;
  startTime: string;
  endTime: string;
  teacher: string;
  day: CourseDay;
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const responseData = error.response.data;

    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData
    ) {
      const message = responseData.message;

      if (Array.isArray(message)) {
        return message.join(', ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to create course.';
}

function getInitialFormState(): CreateCourseFormState {
  return {
    courseName: '',
    startTime: '',
    endTime: '',
    teacher: '',
    day: 'dushanba',
  };
}

function buildCourseTimeDate(value: string) {
  const [hours, minutes] = value.split(':').map(Number);

  return new Date(Date.UTC(2000, 0, 1, hours, minutes, 0, 0));
}

export default function CreateCourse() {
  const [form, setForm] = useState<CreateCourseFormState>(getInitialFormState);
  const [teachers, setTeachers] = useState<Employee[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTeachers() {
      try {
        const employees = await getEmployees();
        if (cancelled) return;

        const activeTeachers = employees
          .filter((employee) => employee.isActive)
          .sort((left, right) => left.name.localeCompare(right.name));

        setTeachers(activeTeachers);
        setError(null);
      } catch (error) {
        if (cancelled) return;
        setTeachers([]);
        setError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setLoadingTeachers(false);
        }
      }
    }

    void loadTeachers();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError(null);
    }

    if (successMessage) {
      setSuccessMessage(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (form.endTime && form.endTime <= form.startTime) {
        setError('End time must be later than start time.');
        setSubmitting(false);
        return;
      }

      const payload: CreateCoursePayload = {
        courseName: form.courseName.trim(),
        startTime: buildCourseTimeDate(form.startTime),
        teacher: form.teacher,
        day: form.day,
      };

      if (form.endTime) {
        payload.endTime = buildCourseTimeDate(form.endTime);
      }

      const createdCourse = await createCourse(payload);

      setForm(getInitialFormState());
      setSuccessMessage(`Course "${createdCourse.courseName}" created successfully.`);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="create-course-page">
      <div className="create-course-header">
        <div>
          <h1 className="create-course-title">Create course</h1>
          <p className="create-course-subtitle">
            Add a new course and assign it to an active teacher.
          </p>
        </div>
        <div className="create-course-endpoint">POST /courses</div>
      </div>

      <div className="create-course-layout">
        <section className="create-course-card">
          <div className="create-course-card-head">
            <h2 className="create-course-card-title">Course details</h2>
            <p className="create-course-card-copy">
              This form matches the backend `Course` schema.
            </p>
          </div>

          <form className="create-course-form" onSubmit={handleSubmit}>
            <div className="create-course-grid">
              <label className="create-course-field">
                <span>Course name</span>
                <input
                  className="create-course-input"
                  type="text"
                  name="courseName"
                  value={form.courseName}
                  onChange={handleFieldChange}
                  placeholder="Frontend fundamentals"
                  required
                />
              </label>

              <label className="create-course-field">
                <span>Day</span>
                <select
                  className="create-course-input"
                  name="day"
                  value={form.day}
                  onChange={handleFieldChange}
                  required
                >
                  {dayOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="create-course-field">
                <span>Teacher</span>
                <select
                  className="create-course-input"
                  name="teacher"
                  value={form.teacher}
                  onChange={handleFieldChange}
                  disabled={loadingTeachers}
                  required
                >
                  <option value="">
                    {loadingTeachers ? 'Loading teachers...' : 'Select teacher'}
                  </option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.employeeNo})
                    </option>
                  ))}
                </select>
              </label>

              <label className="create-course-field">
                <span>Start time</span>
                <small className="create-course-hint">24-hour format, hour only</small>
                <select
                  className="create-course-input"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleFieldChange}
                  required
                >
                  <option value="">Select start hour</option>
                  {hourOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="create-course-field create-course-field--full">
                <span>End time</span>
                <small className="create-course-hint">24-hour format, hour only</small>
                <select
                  className="create-course-input"
                  name="endTime"
                  value={form.endTime ?? ''}
                  onChange={handleFieldChange}
                >
                  <option value="">Select end hour</option>
                  {hourOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error ? <div className="create-course-message error">{error}</div> : null}
            {successMessage ? (
              <div className="create-course-message success">{successMessage}</div>
            ) : null}

            <div className="create-course-actions">
              <button
                className="create-course-button"
                type="submit"
                disabled={submitting || loadingTeachers || teachers.length === 0}
              >
                {submitting ? 'Creating...' : 'Create course'}
              </button>
            </div>
          </form>
        </section>

        <aside className="create-course-side-card">
          <h2 className="create-course-card-title">What gets sent</h2>
          <div className="create-course-side-list">
            <div className="create-course-side-item">
              <span>Endpoint</span>
              <strong>/courses</strong>
            </div>
            <div className="create-course-side-item">
              <span>Fields</span>
              <strong>courseName, startTime, endTime, teacher, day</strong>
            </div>
            <div className="create-course-side-item">
              <span>Teacher source</span>
              <strong>/employees/all</strong>
            </div>
            <div className="create-course-side-item">
              <span>Teachers loaded</span>
              <strong>{loadingTeachers ? 'Loading...' : teachers.length}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
