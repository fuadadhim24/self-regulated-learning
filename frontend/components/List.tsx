"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Droppable } from "react-beautiful-dnd"
import Card from "./Card"
import { getCourses } from "../utils/api"
import { Plus, X, ChevronDown } from "lucide-react"

interface ListProps {
    id: string
    title: string
    cards: Array<{
        id: string
        title: string
        sub_title: string
        description?: string
        difficulty: "easy" | "medium" | "hard" | "expert"
        priority: "low" | "medium" | "high" | "critical"
        learning_strategy: string
        created_at: string
        column_movement_times?: { [columnId: string]: string }
    }>
    isAddingCard: boolean
    onAddCard: (
        listId: string,
        courseCode: string,
        courseName: string,
        material: string,
        difficulty: "easy" | "medium" | "hard" | "expert",
    ) => void
    onCancelAddCard: (listId: string) => void
    onCardClick: (
        listId: string,
        card: {
            id: string
            title: string
            sub_title: string
            description?: string
            difficulty: "easy" | "medium" | "hard" | "expert"
            priority: "low" | "medium" | "high" | "critical"
            learning_strategy: string
            created_at: string
            column_movement_times?: { [columnId: string]: string }
        },
    ) => void
}

const List = ({ id, title, cards, onAddCard, onCardClick }: ListProps) => {
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [courseCode, setCourseCode] = useState("")
    const [courseName, setCourseName] = useState("")
    const [material, setMaterial] = useState("")
    const [courses, setCourses] = useState<{ course_code: string; course_name: string }[]>([])
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token")
            if (token) {
                const response = await getCourses(token)
                if (response.ok) {
                    const data = await response.json()
                    setCourses(data) // Store courses
                }
            }
        }

        fetchData()
    }, [])

    const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCourseName = event.target.value
        setCourseName(selectedCourseName)

        const selectedCourse = courses.find((course) => course.course_name === selectedCourseName)
        if (selectedCourse) {
            setCourseCode(selectedCourse.course_code) // Auto-select course code
        }
    }

    const handleCourseCodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCourseCode = event.target.value
        setCourseCode(selectedCourseCode)

        const selectedCourse = courses.find((course) => course.course_code === selectedCourseCode)
        if (selectedCourse) {
            setCourseName(selectedCourse.course_name) // Auto-select course name
        }
    }

    const handleAddCard = () => {
        if (courseCode && courseName && material.trim()) {
            onAddCard(id, courseCode, courseName, material, "easy")
            setCourseCode("")
            setCourseName("")
            setMaterial("")
            setIsAddingCard(false)
        }
    }

    const handleCancelAddCard = () => {
        setCourseCode("")
        setCourseName("")
        setMaterial("")
        setIsAddingCard(false)
    }

    // Get color based on list title
    const getListHeaderColor = () => {
        switch (title) {
            case "To Do":
                return "bg-blue-50 border-blue-200"
            case "In Progress":
                return "bg-amber-50 border-amber-200"
            case "Review":
                return "bg-purple-50 border-purple-200"
            case "Reflection (Done)":
                return "bg-green-50 border-green-200"
            default:
                return "bg-gray-50 border-gray-200"
        }
    }

    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[280px] max-w-[350px] flex flex-col">
            {/* List Header */}
            <div
                className={`px-4 py-3 flex items-center justify-between rounded-t-lg border-b ${getListHeaderColor()}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center">
                    <h2 className="text-base font-semibold text-gray-800">{title}</h2>
                    <div className="ml-2 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium">
                        {cards.length}
                    </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                    <ChevronDown className={`h-5 w-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
                </button>
            </div>

            {/* List Content */}
            <div
                className={`flex-1 transition-all duration-300 ${isCollapsed ? "max-h-0 overflow-hidden" : "max-h-[1000px]"}`}
            >
                <Droppable droppableId={id}>
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="p-3 space-y-3 min-h-[100px] max-h-[calc(100vh-220px)] overflow-y-auto"
                        >
                            {cards.map((card, index) => (
                                <Card
                                    key={card.id}
                                    id={card.id}
                                    title={card.title}
                                    subTitle={card.sub_title}
                                    difficulty={card.difficulty}
                                    priority={card.priority}
                                    index={index}
                                    onClick={() => onCardClick(id, card)}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                {/* Add Card Form */}
                {isAddingCard && (
                    <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
                        <div className="space-y-3">
                            <select
                                value={courseName}
                                onChange={handleCourseChange}
                                className="w-full p-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Course</option>
                                {courses.map((course) => (
                                    <option key={course.course_code} value={course.course_name}>
                                        {course.course_name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={courseCode}
                                onChange={handleCourseCodeChange}
                                className="w-full p-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Course Code</option>
                                {courses.map((course) => (
                                    <option key={course.course_code} value={course.course_code}>
                                        {course.course_code}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                value={material}
                                onChange={(e) => setMaterial(e.target.value)}
                                placeholder="Enter Material"
                                className="w-full p-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />

                            <div className="flex space-x-2">
                                <button
                                    onClick={handleAddCard}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Add Card
                                </button>
                                <button
                                    onClick={handleCancelAddCard}
                                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Card Button */}
                {!isAddingCard && !isCollapsed && (
                    <div className="p-3 border-t border-gray-200">
                        <button
                            onClick={() => setIsAddingCard(true)}
                            className="w-full flex items-center justify-center gap-1 py-2 px-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-colors text-sm font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            Add Card
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default List

