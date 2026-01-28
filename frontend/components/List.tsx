"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Droppable } from "react-beautiful-dnd"
import Card from "./Card"
import { getCourses } from "../utils/api"
import { Plus, X, ChevronDown, AlertCircle } from "lucide-react"
import type { Card as CardType } from "@/types"
import { CARD_LIMITS } from "./Board/BoardContent"

interface ListProps {
    id: string
    title: string
    cards: CardType[]
    isAddingCard: boolean
    onAddCard: (
        listId: string,
        courseCode: string,
        courseName: string,
        material: string,
        difficulty: "easy" | "medium" | "hard" | "expert",
    ) => void
    onCancelAddCard: (listId: string) => void
    onCardClick: (listId: string, card: CardType) => void
    onShowLimitAlert?: (columnName: string, limit: number) => void
}

const List = ({ id, title, cards, onAddCard, onCardClick, onShowLimitAlert }: ListProps) => {
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
                const response = await getCourses()
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
            // Limit check removed for adding cards to allow soft limits (inline alert serves as warning)
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
                return "bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 border-blue-300 dark:border-blue-700"
            case "In Progress":
                return "bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 border-amber-300 dark:border-amber-700"
            case "Review":
                return "bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 border-purple-300 dark:border-purple-700"
            case "Reflection (Done)":
                return "bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 border-green-300 dark:border-green-700"
            default:
                return "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-gray-300 dark:border-gray-700"
        }
    }

    return (
        <div className="bg-gradient-to-r from-indigo-25 to-purple-25 dark:from-indigo-950 dark:to-purple-950 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[280px] max-w-[350px] flex flex-col">
            {/* List Header */}
            <div
                className={`px-4 py-3 flex items-center justify-between rounded-t-lg border-b ${getListHeaderColor()}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
                    {(() => {
                        const limit = CARD_LIMITS[title];
                        const count = cards.length;
                        const isAtLimit = limit !== undefined && count >= limit;
                        const isNearLimit = limit !== undefined && count === limit - 1;

                        let bgColor = "bg-gray-200 dark:bg-gray-700";
                        let textColor = "text-gray-700 dark:text-gray-300";

                        if (isAtLimit) {
                            bgColor = "bg-red-100 dark:bg-red-900/50";
                            textColor = "text-red-700 dark:text-red-400";
                        } else if (isNearLimit) {
                            bgColor = "bg-amber-100 dark:bg-amber-900/50";
                            textColor = "text-amber-700 dark:text-amber-400";
                        }

                        return (
                            <div className={`ml-2 ${bgColor} ${textColor} rounded-full px-2 py-0.5 text-xs font-medium`}>
                                {limit !== undefined ? `${count}/${limit}` : count}
                            </div>
                        );
                    })()}
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
                            {cards.length > 0 ? (
                                cards.map((card, index) => (
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
                                ))
                            ) : (
                                <div className={`p-4 rounded-lg border-2 border-dashed shadow-sm transition-all duration-300 hover:shadow-md
                                    ${title === "Planning (To Do)" ? "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700" : ""}
                                    ${title === "Monitoring (In Progress)" ? "bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700" : ""}
                                    ${title === "Controlling (Review)" ? "bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700" : ""}
                                    ${title === "Reflection (Done)" ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700" : ""}
                                `}>
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className={`h-5 w-5 
                                            ${title === "Planning (To Do)" ? "text-blue-500 dark:text-blue-400" : ""}
                                            ${title === "Monitoring (In Progress)" ? "text-amber-500 dark:text-amber-400" : ""}
                                            ${title === "Controlling (Review)" ? "text-purple-500 dark:text-purple-400" : ""}
                                            ${title === "Reflection (Done)" ? "text-green-500 dark:text-green-400" : ""}
                                        `} />
                                        <p className={`text-sm font-medium text-center
                                            ${title === "Planning (To Do)" ? "text-blue-700 dark:text-blue-300" : ""}
                                            ${title === "Monitoring (In Progress)" ? "text-amber-700 dark:text-amber-300" : ""}
                                            ${title === "Controlling (Review)" ? "text-purple-700 dark:text-purple-300" : ""}
                                            ${title === "Reflection (Done)" ? "text-green-700 dark:text-green-300" : ""}
                                        `}>
                                            {title === "Planning (To Do)" && "Planning (To Do) is empty! Do you have any new tasks that you want to create?"}
                                            {title === "Monitoring (In Progress)" && "Monitoring (In Progress) is empty! Have you started on any tasks in Planning (To Do)?"}
                                            {title === "Controlling (Review)" && "Controlling (Review) is empty! Have you finished studying any tasks in Monitoring (In Progress)?"}
                                            {title === "Reflection (Done)" && "Reflection (Done) is empty! Have you finished reviewing any tasks in Controlling (Review)?"}
                                        </p>
                                    </div>
                                </div>
                            )}
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

                {/* Limit Reached Alert */}
                {(() => {
                    const limit = CARD_LIMITS[title];
                    const isAtLimit = limit !== undefined && cards.length >= limit;

                    if (isAtLimit && !isCollapsed && !isAddingCard) {
                        let message = "Limit Reached. Complete tasks to add more.";
                        if (title.includes("Planning")) message = "Planning limit reached. Prioritize tasks first!";
                        if (title.includes("Monitoring")) message = "Focus limit reached. Finish current tasks!";
                        if (title.includes("Controlling")) message = "Review limit reached. Complete checks first!";
                        if (title.includes("Reflection")) message = "Reflection limit reached. Archive old tasks.";

                        return (
                            <div className="mx-3 mt-3 mb-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                <div className="text-xs text-red-700 dark:text-red-300">
                                    <span className="font-semibold">Limit Reached ({cards.length}/{limit})</span>
                                    <br />
                                    {message}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Add Card Button */}
                {!isAddingCard && !isCollapsed && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setIsAddingCard(true)}
                            className="w-full flex items-center justify-center gap-1 py-2 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-sm font-medium"
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

