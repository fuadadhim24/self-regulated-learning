"use client"

import { Draggable } from "react-beautiful-dnd"
import { Clock, AlertTriangle, AlertCircle, Percent } from "lucide-react"

interface CardProps {
    id: string
    title: string
    subTitle: string
    difficulty: "easy" | "medium" | "hard" | "expert"
    priority: "low" | "medium" | "high" | "critical"
    grade?: string
    index: number
    onClick: () => void
}

export default function Card({ id, title, subTitle, difficulty, priority, grade, index, onClick }: CardProps) {
    // Get priority icon and color
    const getPriorityDetails = (priority: string) => {
        switch (priority) {
            case "low":
                return {
                    icon: <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />,
                    color:
                        "bg-gradient-to-r from-teal-100 to-teal-200 dark:from-teal-900/40 dark:to-teal-800/40 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700",
                    label: "Low",
                }
            case "medium":
                return {
                    icon: <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />,
                    color:
                        "bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700",
                    label: "Medium",
                }
            case "high":
                return {
                    icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
                    color:
                        "bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700",
                    label: "High",
                }
            case "critical":
                return {
                    icon: <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
                    color:
                        "bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700",
                    label: "Critical",
                }
            default:
                return {
                    icon: <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />,
                    color:
                        "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/40 dark:to-gray-700/40 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700",
                    label: "Unknown",
                }
        }
    }

    // Get difficulty color and label
    const getDifficultyDetails = (difficulty: string) => {
        switch (difficulty) {
            case "easy":
                return {
                    color:
                        "bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700",
                    label: "Easy",
                }
            case "medium":
                return {
                    color:
                        "bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
                    label: "Medium",
                }
            case "hard":
                return {
                    color:
                        "bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700",
                    label: "Hard",
                }
            case "expert":
                return {
                    color:
                        "bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700",
                    label: "Expert",
                }
            default:
                return {
                    color:
                        "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/40 dark:to-gray-700/40 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700",
                    label: "Unknown",
                }
        }
    }

    const priorityDetails = getPriorityDetails(priority)
    const difficultyDetails = getDifficultyDetails(difficulty)

    return (
        <Draggable draggableId={id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm hover:shadow-md transition-all duration-200 
             ${snapshot.isDragging ? "shadow-lg ring-2 ring-indigo-500 ring-opacity-50 rotate-1" : ""}
             transform hover:-translate-y-1 hover:scale-[1.02]`}
                    onClick={onClick}
                >
                    <div className="flex flex-col space-y-3">
                        {/* Title and subtitle */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{title}</h3>
                            <p className="text-sm text-gray-600 dark:text-indigo-400 mt-1 line-clamp-1">{subTitle}</p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityDetails.color}`}
                            >
                                {priorityDetails.icon}
                                <span className="ml-1">{priorityDetails.label}</span>
                            </div>
                            <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficultyDetails.color}`}
                            >
                                <span>{difficultyDetails.label}</span>
                            </div>
                            {grade && (
                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border-gray-200">
                                    <Percent className="h-3 w-3 mr-1" />
                                    <span>{grade}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    )
}
