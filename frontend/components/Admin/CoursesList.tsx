// components/Admin/CoursesList.tsx
import { useEffect, useState } from "react";
import CourseForm from "./CoursesForm";

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    materials: string[];
}

export default function CoursesList() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Fetch courses from API
    useEffect(() => {
        // Example API call (replace with your actual API)
        fetch("/api/courses")
            .then((res) => res.json())
            .then((data) => setCourses(data))
            .catch(console.error);
    }, []);

    const handleDeleteCourse = async (id: string) => {
        // Call delete API, then update state
        await fetch(`/api/courses/${id}`, { method: "DELETE" });
        setCourses((prev) => prev.filter((course) => course.id !== id));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Courses</h2>
            <CourseForm onCourseSaved={(course) => setCourses((prev) => [...prev, course])} />
            <ul className="mt-4">
                {courses.map((course) => (
                    <li key={course.id} className="border p-2 rounded flex justify-between items-center">
                        <div>
                            <p>{course.course_name} ({course.course_code})</p>
                            <p className="text-sm text-gray-600">Materials: {course.materials.join(", ")}</p>
                        </div>
                        <div>
                            <button
                                onClick={() => setEditingCourse(course)}
                                className="text-blue-500 mr-2"
                            >
                                Edit
                            </button>
                            <button onClick={() => handleDeleteCourse(course.id)} className="text-red-500">
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
