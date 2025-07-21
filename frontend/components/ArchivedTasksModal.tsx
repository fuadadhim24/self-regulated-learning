"use client"

import { useState } from "react"
import type { Card } from "@/types"
import { Search, X, RotateCcw, Trash2, ChevronDown, Filter } from "lucide-react"

interface ArchivedTasksModalProps {
    archivedTasks: Card[]
    onClose: () => void
    onRestore: (cardId: string) => void
    onDelete: (cardId: string) => void
}

export default function ArchivedTasksModal({ archivedTasks, onClose, onRestore, onDelete }: ArchivedTasksModalProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterOpen, setFilterOpen] = useState(false)
    const [filters, setFilters] = useState({
        priority: [] as string[],
        difficulty: [] as string[],
    })

    // Filter tasks based on search term and filters
    const filteredTasks = archivedTasks.filter((task) => {
        const matchesSearch =
            (task.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (task.sub_title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (task.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())

        const matchesPriority = filters.priority.length === 0 || filters.priority.includes(task.priority)
        const matchesDifficulty = filters.difficulty.length === 0 || filters.difficulty.includes(task.difficulty)

        return matchesSearch && matchesPriority && matchesDifficulty
    })

    const toggleFilter = (type: "priority" | "difficulty", value: string) => {
        setFilters((prev) => {
            const currentFilters = [...prev[type]]
            const index = currentFilters.indexOf(value)

            if (index === -1) {
                currentFilters.push(value)
            } else {
                currentFilters.splice(index, 1)
            }

            return {
                ...prev,
                [type]: currentFilters,
            }
        })
    }

    // Get color based on priority
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "low":
                return "bg-teal-100 text-teal-800 border-teal-200"
            case "medium":
                return "bg-green-100 text-green-800 border-green-200"
            case "high":
                return "bg-amber-100 text-amber-800 border-amber-200"
            case "critical":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    // Get color based on difficulty
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "medium":
                return "bg-indigo-100 text-indigo-800 border-indigo-200"
            case "hard":
                return "bg-orange-100 text-orange-800 border-orange-200"
            case "expert":
                return "bg-purple-100 text-purple-800 border-purple-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Archived Tasks</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="px-6 py-3 border-b">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search archived tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setSearchTerm("")}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <button
                            className={`flex items-center gap-1 px-3 py-2 border rounded-md text-sm ${filterOpen || Object.values(filters).some((f) => f.length > 0)
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                            onClick={() => setFilterOpen(!filterOpen)}
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                        </button>
                    </div>

                    {/* Filter options */}
                    {filterOpen && (
                        <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
                                    <div className="space-y-1">
                                        {["low", "medium", "high", "critical"].map((priority) => (
                                            <label key={priority} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.priority.includes(priority)}
                                                    onChange={() => toggleFilter("priority", priority)}
                                                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                />
                                                <span
                                                    className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}
                                                >
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Difficulty</h3>
                                    <div className="space-y-1">
                                        {["easy", "medium", "hard", "expert"].map((difficulty) => (
                                            <label key={difficulty} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.difficulty.includes(difficulty)}
                                                    onChange={() => toggleFilter("difficulty", difficulty)}
                                                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                />
                                                <span
                                                    className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}
                                                >
                                                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto h-12 w-12 text-gray-400 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Search className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No archived tasks found</h3>
                            <p className="text-gray-500">
                                {searchTerm || Object.values(filters).some((f) => f.length > 0)
                                    ? "Try adjusting your search or filters"
                                    : "You don't have any archived tasks yet"}
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {filteredTasks.map((task) => (
                                <li
                                    key={task.id}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-4">
                                        {/* Header */}
                                        <div className="mb-3">
                                            <h3 className="font-semibold text-gray-900">{task.title || "Untitled Task"}</h3>
                                            {task.sub_title && <p className="text-sm text-gray-600">{task.sub_title}</p>}
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority || "medium")}`}
                                            >
                                                {(task.priority || "medium").charAt(0).toUpperCase() + (task.priority || "medium").slice(1)} Priority
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty || "easy")}`}
                                            >
                                                {(task.difficulty || "easy").charAt(0).toUpperCase() + (task.difficulty || "easy").slice(1)} Difficulty
                                            </span>
                                            {task.rating !== undefined && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border-yellow-200">
                                                    Rating: {task.rating}/5
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {task.description && (
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                onClick={() => onRestore(task.id)}
                                            >
                                                <RotateCcw className="h-4 w-4 mr-1" />
                                                Restore
                                            </button>
                                            <button
                                                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                                                        onDelete(task.id)
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"} found
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

