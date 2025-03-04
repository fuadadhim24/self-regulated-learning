// components/Admin/CourseForm.tsx
import { useState } from "react";

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    materials: string[];
}

interface CourseFormProps {
    onCourseSaved: (course: Course) => void;
}

export default function CourseForm({ onCourseSaved }: CourseFormProps) {
    const [courseCode, setCourseCode] = useState("");
    const [courseName, setCourseName] = useState("");
    const [materials, setMaterials] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newCourse = {
            id: `${Date.now()}`,
            course_code: courseCode,
            course_name: courseName,
            materials: materials.split(",").map((m) => m.trim()),
        };

        // Call your API to save the course
        const res = await fetch("/api/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCourse),
        });
        if (res.ok) {
            onCourseSaved(newCourse);
            setCourseCode("");
            setCourseName("");
            setMaterials("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border p-4 rounded">
            <h3 className="font-bold mb-2">Add New Course</h3>
            <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="Course Code"
                className="border p-2 rounded w-full mb-2"
            />
            <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Course Name"
                className="border p-2 rounded w-full mb-2"
            />
            <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="Materials (comma separated)"
                className="border p-2 rounded w-full mb-2"
            />
            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded">
                Save Course
            </button>
        </form>
    );
}
