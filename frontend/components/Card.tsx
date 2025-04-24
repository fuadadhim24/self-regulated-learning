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
                    icon: <Clock className="h-4 w-4 text-teal-600" />,
                    color: "bg-teal-100 text-teal-800 border-teal-200",
                    label: "Low",
                }
            case "medium":
                return {
                    icon: <Clock className="h-4 w-4 text-green-600" />,
                    color: "bg-green-100 text-green-800 border-green-200",
                    label: "Medium",
                }
            case "high":
                return {
                    icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
                    color: "bg-amber-100 text-amber-800 border-amber-200",
                    label: "High",
                }
            case "critical":
                return {
                    icon: <AlertCircle className="h-4 w-4 text-red-600" />,
                    color: "bg-red-100 text-red-800 border-red-200",
                    label: "Critical",
                }
            default:
                return {
                    icon: <Clock className="h-4 w-4 text-gray-600" />,
                    color: "bg-gray-100 text-gray-800 border-gray-200",
                    label: "Unknown",
                }
        }
    }

    // Get difficulty color and label
    const getDifficultyDetails = (difficulty: string) => {
        switch (difficulty) {
            case "easy":
                return {
                    color: "bg-blue-100 text-blue-800 border-blue-200",
                    label: "Easy",
                }
            case "medium":
                return {
                    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
                    label: "Medium",
                }
            case "hard":
                return {
                    color: "bg-orange-100 text-orange-800 border-orange-200",
                    label: "Hard",
                }
            case "expert":
                return {
                    color: "bg-purple-100 text-purple-800 border-purple-200",
                    label: "Expert",
                }
            default:
                return {
                    color: "bg-gray-100 text-gray-800 border-gray-200",
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
                    className={`bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 
                   ${snapshot.isDragging ? "shadow-lg ring-2 ring-blue-500 ring-opacity-50" : ""}`}
                    onClick={onClick}
                >
                    <div className="flex flex-col space-y-3">
                        {/* Title and subtitle */}
                        <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-2">{subTitle}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{title}</p>
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

