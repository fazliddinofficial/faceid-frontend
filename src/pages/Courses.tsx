import { useEffect, useState } from "react";
import { deleteCourseById, getAllCourses, type Course } from "../api";
import { styles } from "./style";

const formatTime = (iso: string | undefined) => {
  if (!iso) return "--:--";
  if (/^\d{2}:\d{2}/.test(iso)) return iso.slice(0, 5);
  return new Date(iso).toISOString().slice(11, 16);
};

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (id = "") => {
    await deleteCourseById(id);
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    getAllCourses()
      .then(setCourses)
      .catch((err) => setError(err?.message ?? "Failed to load courses"))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <p style={styles.courseLabel}>Loading...</p>;
  if (error) return <p style={{ color: "#dc2626" }}>{error}</p>;
  if (!courses.length)
    return <p style={styles.courseLabel}>No courses found.</p>;

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {courses.map((data) => (
        <div key={data._id} style={styles.card}>
          <div style={styles.header}>
            <div>
              <p style={styles.courseLabel}>Course</p>
              <p style={styles.courseName}>{data.courseName}</p>
            </div>
            <span style={styles.badge}>{capitalize(data.day)}</span>
          </div>

          <div style={styles.timeBlock}>
            <div>
              <p style={styles.timeLabel}>Start</p>
              <p style={styles.timeValue}>{formatTime(data.startTime)}</p>
            </div>
            <span style={styles.arrow}>→</span>
            <div>
              <p style={styles.timeLabel}>End</p>
              <p style={styles.timeValue}>{formatTime(data.endTime)}</p>
            </div>
          </div>

          <div style={styles.row}>
            <span style={styles.rowLabel}>Teacher</span>
            <div style={styles.teacherRow}>
              <div style={styles.avatar}>{initials(data.teacher.name)}</div>
              <span style={styles.teacherName}>{data.teacher.name}</span>
            </div>
          </div>

          <div style={styles.row}>
            <span style={styles.rowLabel}>Employee #</span>
            <span style={styles.rowValue}>{data.teacher.employeeNo}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.rowLabel}>Status</span>
            <span style={styles.activeText}>
              <span style={styles.activeDot} />
              {data.teacher.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div style={styles.row}>
            <span style={styles.rowLabel}>Sync</span>
            <span style={styles.rowValue}>{data.teacher.verifyMode}</span>
          </div>

          <div style={{ ...styles.row, ...styles.rowLast }}>
            <span style={{ ...styles.rowLabel, fontSize: 12 }}>ID</span>
            <span style={styles.idText}>{data._id}</span>
          </div>
          <button onClick={() => handleDelete(data._id)} style={styles.button}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default CourseList;
