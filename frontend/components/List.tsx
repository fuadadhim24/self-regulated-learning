import { useEffect, useState } from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Card } from './Board/Board'
import { getCourses } from '../utils/api'

interface ListProps {
    id: string
    title: string
    cards: Card[]
    isAddingCard: boolean
    onAddCard: (listId: string, courseCode: string, courseName: string, material: string, difficulty: 'easy' | 'medium' | 'hard') => void
    onCancelAddCard: (listId: string) => void
    onCardClick: (listId: string, card: Card) => void
}

const List = ({ id, title, cards, onAddCard, onCardClick }: ListProps) => {
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [courseCode, setCourseCode] = useState('')
    const [courseName, setCourseName] = useState('')
    const [material, setMaterial] = useState('')
    const [courses, setCourses] = useState<{ course_code: string, course_name: string, materials: string[] }[]>([])
    const [courseCodes, setCourseCodes] = useState<string[]>([])
    const [materials, setMaterials] = useState<string[]>([])

    // Fetch courses when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token')
            if (token) {
                const response = await getCourses(token)
                if (response.ok) {
                    const data = await response.json()
                    setCourses(data) // Set available courses
                }
            }
        }

        fetchData()
    }, [])

    // Handle course selection
    const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCourseName = event.target.value
        setCourseName(selectedCourseName)
        setMaterial('') // Reset material when course is selected

        const selectedCourse = courses.find(course => course.course_name === selectedCourseName)
        if (selectedCourse) {
            setCourseCode(selectedCourse.course_code) // Automatically select course code for the chosen course
            setMaterials(selectedCourse.materials) // Update materials based on the selected course
        }
    }

    // Handle course code selection
    const handleCourseCodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCourseCode = event.target.value
        setCourseCode(selectedCourseCode)
        setMaterial('') // Reset material when course code is selected

        const selectedCourse = courses.find(course => course.course_code === selectedCourseCode)
        if (selectedCourse) {
            setCourseName(selectedCourse.course_name) // Automatically select course name for the chosen course code
            setMaterials(selectedCourse.materials) // Update materials based on the selected course code
        }
    }

    // Handle material selection
    const handleMaterialChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setMaterial(event.target.value)
    }

    const handleAddCard = () => {
        if (courseCode && courseName && material) {
            onAddCard(id, courseCode, courseName, material, 'easy') // Always pass 'easy' as difficulty
            setCourseCode('')
            setCourseName('')
            setMaterial('')
            setIsAddingCard(false)
        }
    }

    const handleCancelAddCard = () => {
        setCourseCode('')
        setCourseName('')
        setMaterial('')
        setIsAddingCard(false)
    }

    return (
        <div className="bg-gray-200 p-4 rounded-lg w-72">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <Droppable droppableId={id}>
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                    >
                        {cards.map((card, index) => (
                            <Draggable key={card.id} draggableId={card.id} index={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="bg-white p-3 rounded shadow cursor-pointer"
                                        onClick={() => onCardClick(id, card)}
                                    >
                                        <div>
                                            {/* Card Title */}
                                            <div className="text-blue-600 font-bold text-lg">
                                                {card.title}
                                            </div>

                                            {/* Card Subtitle */}
                                            {card.sub_title && (
                                                <div className="text-gray-500 text-sm mt-1">
                                                    {card.sub_title}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        {isAddingCard && (
                            <div className="p-2">
                                {/* Course Dropdown */}
                                <select
                                    value={courseName}
                                    onChange={handleCourseChange}
                                    className="w-full p-2 rounded border border-gray-300"
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course.course_code} value={course.course_name}>
                                            {course.course_name}
                                        </option>
                                    ))}
                                </select>

                                {/* Course Code Dropdown */}
                                <select
                                    value={courseCode}
                                    onChange={handleCourseCodeChange}
                                    className="w-full p-2 rounded border border-gray-300 mt-2"
                                >
                                    <option value="">Select Course Code</option>
                                    {courses.map(course => (
                                        <option key={course.course_code} value={course.course_code}>
                                            {course.course_code}
                                        </option>
                                    ))}
                                </select>

                                {/* Material Dropdown */}
                                <select
                                    value={material}
                                    onChange={handleMaterialChange}
                                    className="w-full p-2 rounded border border-gray-300 mt-2"
                                    disabled={!courseCode && !courseName}
                                >
                                    <option value="">Select Material</option>
                                    {materials.map(mat => (
                                        <option key={mat} value={mat}>
                                            {mat}
                                        </option>
                                    ))}
                                </select>

                                <div className="mt-2 flex space-x-2">
                                    <button
                                        onClick={handleAddCard}
                                        className="bg-blue-500 text-white p-2 rounded"
                                    >
                                        Add Card
                                    </button>
                                    <button
                                        onClick={handleCancelAddCard}
                                        className="bg-gray-500 text-white p-2 rounded"
                                    >
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
