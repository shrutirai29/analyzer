import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import CourseCard from "../components/CourseCard";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    try {
      const response = await api.get("/courses/");
      setCourses(response.data.courses || []);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleRemove = async (courseId) => {
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success("Course removed");
    } catch {
      toast.error("Failed to remove course");
    }
  };

  const handleToggleComplete = async (courseId) => {
    try {
      const response = await api.patch(`/courses/${courseId}/complete`);
      setCourses((prev) => prev.map((course) => (course.id === courseId ? response.data.course : course)));
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading courses...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">My Courses</h1>
      {!courses.length ? (
        <div className="card text-sm text-gray-500">No saved courses yet. Save recommendations from the Analyze page.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="space-y-2">
              <CourseCard course={course} showSave={false} showRemove onRemove={() => handleRemove(course.id)} />
              <button className="btn-ghost text-xs" onClick={() => handleToggleComplete(course.id)}>
                Mark as {course.is_completed ? "incomplete" : "completed"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
