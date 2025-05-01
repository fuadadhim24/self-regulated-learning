"use client"

import { useState } from "react"
import { X, Archive, Trash2 } from "lucide-react"
import TaskInfo from "./TaskInfo"
import StartStopToggle from "./StartStopToggle"
import DifficultyDropdown from "./DifficultyDropdown"
import PriorityDropdown from "./PriorityDropdown"
import Checklist from "./Checklist"
import LearningStrategiesDropdown from "./LearningStrategiesDropdown"
import StarRating from "./StarRating"
import TaskNotes from "./TaskNotes"
import WorkLinks from "./LinkInput"
import GradeInput from "./GradeInput"
import type { Checklists } from "@/types"

interface TaskDetailsProps {
    listName: string
    boardId: string
    card: {
        id: string
        title: string
        sub_title: string
        description?: string
        difficulty: "easy" | "medium" | "hard" | "expert"
        priority: "low" | "medium" | "high" | "critical"
        learning_strategy: string
        checklists?: Checklists[]
        rating?: number
        notes?: string
        pre_test_grade?: string
        post_test_grade?: string
        created_at: string
        column_movement_times?: { [columnId: string]: string }
        links?: string[]
    }
    onClose: () => void
    onUpdateTitle: (cardId: string, newTitle: string) => void
    onUpdateSubTitle: (cardId: string, newSubTitle: string) => void
    onUpdateDescription: (cardId: string, newDescription: string) => void
    onUpdateDifficulty: (cardId: string, newDifficulty: "easy" | "medium" | "hard" | "expert") => void
    onUpdatePriority: (cardId: string, newPriority: "low" | "medium" | "high" | "critical") => void
    onUpdateLearningStrategy: (cardId: string, newLearningStrategy: string) => void
    onUpdateChecklists: (cardId: string, updatedChecklists: Checklists[]) => void
    onUpdateRating: (cardId: string, newRating: number) => void
    onUpdateNotes: (cardId: string, newNotes: string) => void
    onUpdatePreTestGrade: (cardId: string, newGrade: string) => void
    onUpdatePostTestGrade: (cardId: string, newGrade: string) => void
    onArchive: (cardId: string) => void
    onDelete: (cardId: string) => void
    onUpdateLinks?: (cardId: string, links: string[]) => void
}

export default function TaskDetails({
    listName,
    boardId,
    card,
    onClose,
    onUpdateTitle,
    onUpdateSubTitle,
    onUpdateDescription,
    onUpdateDifficulty,
    onUpdatePriority,
    onUpdateLearningStrategy,
    onUpdateChecklists,
    onUpdateRating,
    onUpdateNotes,
    onUpdatePreTestGrade,
    onUpdatePostTestGrade,
    onArchive,
    onDelete,
    onUpdateLinks,
}: TaskDetailsProps) {
    const [difficulty, setDifficulty] = useState(card.difficulty)
    const [priority, setPriority] = useState(card.priority)
    const [learningStrategy, setLearningStrategy] = useState(card.learning_strategy ?? "Learning Strategies")
    const [checklists, setChecklists] = useState<Checklists[]>(card.checklists ?? [])
    const [rating, setRating] = useState(card.rating ?? 0)
    const [notes, setNotes] = useState(card.notes ?? "")
    const [preTestGrade, setPreTestGrade] = useState(card.pre_test_grade ?? "")
    const [postTestGrade, setPostTestGrade] = useState(card.post_test_grade ?? "")
    const [links, setLinks] = useState<string[]>(card.links ?? [])
    const isRatingEnabled = listName === "Reflection (Done)"
    const isNotesEnabled = listName === "Reflection (Done)"

    const handleDifficultyChange = (newDifficulty: "easy" | "medium" | "hard" | "expert") => {
        setDifficulty(newDifficulty)
        onUpdateDifficulty(card.id, newDifficulty)
    }

    const handlePriorityChange = (newPriority: "low" | "medium" | "high" | "critical") => {
        setPriority(newPriority)
        onUpdatePriority(card.id, newPriority)
    }

    const handleLearningStrategyChange = (newLearningStrategy: string) => {
        setLearningStrategy(newLearningStrategy)
        onUpdateLearningStrategy(card.id, newLearningStrategy)
    }

    const handleUpdateChecklists = (updatedChecklists: Checklists[]) => {
        setChecklists(updatedChecklists)
        onUpdateChecklists(card.id, updatedChecklists)
    }

    const handleRatingChange = (newRating: number) => {
        setRating(newRating)
        onUpdateRating(card.id, newRating)
    }

    const handleUpdateNotes = (cardId: string, newNotes: string) => {
        setNotes(newNotes)
        onUpdateNotes(cardId, newNotes)
    }

    const handleUpdatePreTestGrade = (newGrade: string) => {
        setPreTestGrade(newGrade)
        onUpdatePreTestGrade(card.id, newGrade)
    }

    const handleUpdatePostTestGrade = (newGrade: string) => {
        setPostTestGrade(newGrade)
        onUpdatePostTestGrade(card.id, newGrade)
    }

    const handleUpdateLinks = (newLinks: string[]) => {
        setLinks(newLinks)
        if (onUpdateLinks) {
            onUpdateLinks(card.id, newLinks)
        }
    }

    // Get color based on list name
    const getHeaderColor = () => {
        switch (listName) {
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

    // Add this function to format dates
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className={`px-6 py-4 border-b flex justify-between items-center ${getHeaderColor()}`}>
                    <h2 className="text-lg font-semibold text-gray-800">Task Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <TaskInfo
                        card={card}
                        onUpdateTitle={onUpdateTitle}
                        onUpdateSubTitle={onUpdateSubTitle}
                        onUpdateDescription={onUpdateDescription}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-6">
                            {/* Timer and Grade section */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <StartStopToggle cardId={card.id} />
                                </div>
                                <div className="w-full sm:w-64">
                                    <GradeInput
                                        preTestGrade={preTestGrade}
                                        postTestGrade={postTestGrade}
                                        onUpdatePreTestGrade={handleUpdatePreTestGrade}
                                        onUpdatePostTestGrade={handleUpdatePostTestGrade}
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <Checklist cardId={card.id} checklists={checklists} onUpdateChecklists={handleUpdateChecklists} />
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <WorkLinks
                                    links={links}
                                    onChange={(newLinks) => {
                                        setLinks(newLinks)
                                        handleUpdateLinks(newLinks)
                                    }}
                                />
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <TaskNotes
                                    cardId={card.id}
                                    notes={notes}
                                    onUpdateNotes={handleUpdateNotes}
                                    isDisabled={!isNotesEnabled}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Task Properties</h3>
                                <div className="space-y-4">
                                    <PriorityDropdown priority={priority} onChange={handlePriorityChange} />
                                    <DifficultyDropdown difficulty={difficulty} onChange={handleDifficultyChange} />
                                    <LearningStrategiesDropdown strategy={learningStrategy} onChange={handleLearningStrategyChange} />
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Learning Reflection</h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        {isRatingEnabled
                                            ? "Rate how well you understood this material:"
                                            : "Rating will be available when task is completed"}
                                    </p>
                                    <StarRating rating={rating} onRate={handleRatingChange} isDisabled={!isRatingEnabled} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        Close
                    </button>

                    <button
                        onClick={() => onArchive(card.id)}
                        className="flex items-center justify-center gap-1 py-2 px-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700 hover:bg-amber-100 transition-colors text-sm font-medium"
                    >
                        <Archive className="h-4 w-4" />
                        Archive
                    </button>

                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                                onDelete(card.id)
                            }
                        }}
                        className="flex items-center justify-center gap-1 py-2 px-4 bg-red-50 border border-red-200 rounded-md text-red-700 hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
