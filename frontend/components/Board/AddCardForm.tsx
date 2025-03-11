"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface AddCardFormProps {
    onSubmit: (courseCode: string, courseName: string, material: string, difficulty: "easy" | "medium" | "hard" | "expert") => void
    onCancel: () => void
}

export default function AddCardForm({ onSubmit, onCancel }: AddCardFormProps) {
    const [courseCode, setCourseCode] = useState("")
    const [courseName, setCourseName] = useState("")
    const [material, setMaterial] = useState("")
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "expert">("easy")

    const handleSubmit = () => {
        if (courseCode && courseName && material) {
            onSubmit(courseCode, courseName, material, difficulty)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">Add New Card</h3>
                <button
                    onClick={onCancel}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                    <input
                        type="text"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Name</label>
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Material</label>
                    <input
                        type="text"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="expert">Expert</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
                <button
                    className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                    onClick={handleSubmit}
                >
                    Add Card
                </button>
            </div>
        </div>
    )
}

