// pages/admin/index.tsx
import { useState } from "react";
import CoursesList from "@/components/Admin/CoursesList";
import LearningStrategiesList from "@/components/Admin/LearningStrategiesList";
import UsersList from "@/components/Admin/UsersList";

type Section = "courses" | "learningStrategies" | "users";

export default function AdminDashboard() {
    const [selectedSection, setSelectedSection] = useState<Section>("courses");

    return (
        <div className="min-h-screen flex">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
                <nav className="space-y-2">
                    <button
                        className={`w-full text-left p-2 rounded ${selectedSection === "courses" ? "bg-gray-700" : ""}`}
                        onClick={() => setSelectedSection("courses")}
                    >
                        Manage Courses
                    </button>
                    <button
                        className={`w-full text-left p-2 rounded ${selectedSection === "learningStrategies" ? "bg-gray-700" : ""}`}
                        onClick={() => setSelectedSection("learningStrategies")}
                    >
                        Manage Learning Strategies
                    </button>
                    <button
                        className={`w-full text-left p-2 rounded ${selectedSection === "users" ? "bg-gray-700" : ""}`}
                        onClick={() => setSelectedSection("users")}
                    >
                        View Users & Boards
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow p-6">
                {selectedSection === "courses" && <CoursesList />}
                {selectedSection === "learningStrategies" && <LearningStrategiesList />}
                {selectedSection === "users" && <UsersList />}
            </main>
        </div>
    );
}
