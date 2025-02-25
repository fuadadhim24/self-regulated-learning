"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Droppable, Draggable } from "react-beautiful-dnd"
import Card from "./Card"
import { getCourses } from "../utils/api"

interface ListProps {
    id: string
    title: string
    cards: Array<{
        id: string
        title: string
        sub_title: string
        description?: string
        difficulty: "easy" | "medium" | "hard"
        priority: "low" | "medium" | "high"
        learning_strategy: string
    }>
    isAddingCard: boolean
    onAddCard: (
        listId: string,
        courseCode: string,
        courseName: string,
        material: string,
        difficulty: "easy" | "medium" | "hard",
    ) => void
    onCancelAddCard: (listId: string) => void
    onCardClick: (
        listId: string,
        card: {
            id: string
            title: string
            sub_title: string
            description?: string
            difficulty: "easy" | "medium" | "hard"
            priority: "low" | "medium" | "high"
            learning_strategy: string
        },
    ) => void
}

const List = ({ id, title, cards, onAddCard, onCardClick }: ListProps) => {
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [courseCode, setCourseCode] = useState("")
    const [courseName, setCourseName] = useState("")
    const [material, setMaterial] = useState("")
    const [courses, setCourses] = useState<{ course_code: string; course_name: string }[]>([])

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

    return (
        <div className="bg-gray-200 p-4 rounded-lg flex-1 min-w-[250px] max-w-[400px]">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <Droppable droppableId={id}>
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 min-h-[100px]">
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

                        {isAddingCard && (
                            <div className="p-2">
                                <select
                                    value={courseName}
                                    onChange={handleCourseChange}
                                    className="w-full p-2 rounded border border-gray-300"
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
                                    className="w-full p-2 rounded border border-gray-300 mt-2"
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
                                    className="w-full p-2 rounded border border-gray-300 mt-2"
                                />

                                <div className="mt-2 flex space-x-2">
                                    <button onClick={handleAddCard} className="bg-blue-500 text-white p-2 rounded">
                                        Add Card
                                    </button>
                                    <button onClick={handleCancelAddCard} className="bg-gray-500 text-white p-2 rounded">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Droppable>

            {!isAddingCard && (
                <button
                    onClick={() => setIsAddingCard(true)}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Add Card
                </button>
            )}
        </div>
    )
}

export default List
