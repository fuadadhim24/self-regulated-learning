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
import GradeInput from "./GradeInput"
import LinkInput from "./LinkInput"
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
        links?: { id: string; url: string }[]
        rating?: number
        notes?: string
        pre_test_grade?: string
        post_test_grade?: string
        created_at: string
        column_movement_times?: { [columnId: string]: string }
    }
    onClose: () => void
    onUpdateTitle: (cardId: string, newTitle: string) => void
    onUpdateSubTitle: (cardId: string, newSubTitle: string) => void
    onUpdateDescription: (cardId: string, newDescription: string) => void
    onUpdateDifficulty: (cardId: string, newDifficulty: "easy" | "medium" | "hard" | "expert") => void
    onUpdatePriority: (cardId: string, newPriority: "low" | "medium" | "high" | "critical") => void
    onUpdateLearningStrategy: (cardId: string, newLearningStrategy: string) => void
    onUpdateChecklists: (cardId: string, updatedChecklists: Checklists[]) => void
    onUpdateLinks: (cardId: string, updatedLinks: { id: string; url: string }[]) => void
    onUpdateRating: (cardId: string, newRating: number) => void
    onUpdateNotes: (cardId: string, newNotes: string) => void
    onUpdatePreTestGrade: (cardId: string, newGrade: string) => void
    onUpdatePostTestGrade: (cardId: string, newGrade: string) => void
    onArchive: (cardId: string) => void
    onDelete: (cardId: string) => void
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
    const [links, setLinks] = useState<{ id: string; url: string }[]>(card.links ?? [])
    const [isTimerActive, setIsTimerActive] = useState(false)
    const isRatingEnabled = listName === "Reflection (Done)"
    const isNotesEnabled = listName === "Reflection (Done)" || listName === "Controlling (Review)"
    const isPreTestEnabled = listName !== "Reflection (Done)"
    const isPostTestEnabled = listName === "Controlling (Review)" || listName === "Reflection (Done)"
    const isDeleteEnabled = listName === "Reflection (Done)" || !isTimerActive

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

    const handleUpdateLinks = (updatedLinks: { id: string; url: string }[]) => {
        setLinks(updatedLinks)
        onUpdateLinks(card.id, updatedLinks)
    }

    // Get color based on list name
    const getHeaderColor = () => {
        switch (listName) {
            case "To Do":
                return "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
            case "In Progress":
                return "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900"
            case "Review":
                return "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
            case "Reflection (Done)":
                return "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
            default:
                return "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950"
        }
    }

    // Add this function to format dates
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-hidden flex flex-col border border-indigo-200 dark:border-indigo-800">
                {/* Header */}
                <div
                    className={`px-6 py-4 border-b border-indigo-200 dark:border-indigo-800 flex justify-between items-center ${getHeaderColor()}`}
                >
                    <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        Task Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 rounded-full p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/30">
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
                                    <StartStopToggle
                                        cardId={card.id}
                                        listName={listName}
                                        onToggleStateChange={setIsTimerActive}
                                    />
                                </div>
                                <div className="w-full sm:w-64">
                                    <GradeInput
                                        preTestGrade={preTestGrade}
                                        postTestGrade={postTestGrade}
                                        onUpdatePreTestGrade={handleUpdatePreTestGrade}
                                        onUpdatePostTestGrade={handleUpdatePostTestGrade}
                                        isPreTestDisabled={!isPreTestEnabled}
                                        isPostTestDisabled={!isPostTestEnabled}
                                    />
                                </div>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-all duration-300">
                                <Checklist cardId={card.id} checklists={checklists} onUpdateChecklists={handleUpdateChecklists} />
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-all duration-300">
                                <LinkInput cardId={card.id} links={links} onUpdateLinks={handleUpdateLinks} />
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-all duration-300">
                                <TaskNotes
                                    cardId={card.id}
                                    notes={notes}
                                    onUpdateNotes={handleUpdateNotes}
                                    isDisabled={!isNotesEnabled}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-all duration-300">
                                <h3 className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-3">
                                    Task Properties
                                </h3>
                                <div className="space-y-4">
                                    <PriorityDropdown priority={priority} onChange={handlePriorityChange} />
                                    <DifficultyDropdown difficulty={difficulty} onChange={handleDifficultyChange} />
                                    <LearningStrategiesDropdown selectedStrategy={learningStrategy} onStrategyChange={handleLearningStrategyChange} />
                                </div>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-all duration-300">
                                <h3 className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-3">
                                    Learning Reflection
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <div className="px-6 py-4 border-t border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-md text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                    >
                        Close
                    </button>

                    <button
                        onClick={() => onArchive(card.id)}
                        className="flex items-center justify-center gap-1 py-2 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 border border-amber-400 rounded-md text-white hover:shadow-lg transition-all duration-200 text-sm font-medium transform hover:-translate-y-0.5"
                    >
                        <Archive className="h-4 w-4" />
                        Archive
                    </button>

                    <div className="flex flex-col items-end">
                        <div className="relative group">
                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                                        onDelete(card.id)
                                    }
                                }}
                                disabled={!isDeleteEnabled}
                                className={`flex items-center justify-center gap-1 py-2 px-4 ${isDeleteEnabled
                                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border border-red-400 text-white hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border border-gray-400"
                                    } rounded-md text-sm font-medium`}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                            {!isDeleteEnabled && !isRatingEnabled && (
                                <div className="absolute -top-8 right-0 w-max max-w-xs px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    Cannot delete while timer is active
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
