"use client"

import { useState } from "react"
import TaskInfo from "./TaskInfo"
import StartStopToggle from "./StartStopToggle"
import DifficultyDropdown from "./DifficultyDropdown"
import PriorityDropdown from "./PriorityDropdown"
import Checklist from "./Checklist"
import LearningStrategiesDropdown from "./LearningStrategiesDropdown"
import StarRating from "./StarRating"
import TaskNotes from "./TaskNotes"
import { Checklists } from "@/types"

interface TaskDetailsProps {
    listName: string
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
    onArchive: (cardId: string) => void
    onDelete: (cardId: string) => void
}

export default function TaskDetails({
    listName,
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
    onArchive,
    onDelete
}: TaskDetailsProps) {
    const [isToggleOn, setIsToggleOn] = useState(false)
    const [difficulty, setDifficulty] = useState(card.difficulty)
    const [priority, setPriority] = useState(card.priority)
    const [learningStrategy, setLearningStrategy] = useState(card.learning_strategy ?? "Learning Strategies")
    const [checklists, setChecklists] = useState<Checklists[]>(card.checklists ?? [])
    const [rating, setRating] = useState(card.rating ?? 0)
    const [notes, setNotes] = useState(card.notes ?? "")
    const isRatingEnabled = listName === "Reflection (Done)";
    const isNotesEnabled = listName === "Reflection (Done)";

    const handleToggle = () => {
        setIsToggleOn(!isToggleOn)
    }

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 w-[600px]">
                <TaskInfo
                    card={card}
                    onUpdateTitle={onUpdateTitle}
                    onUpdateSubTitle={onUpdateSubTitle}
                    onUpdateDescription={onUpdateDescription}
                />

                <div className="flex justify-between gap-4">
                    <div className="w-1/2">
                        <StartStopToggle isToggleOn={isToggleOn} onToggle={handleToggle} />
                        <Checklist
                            cardId={card.id}
                            checklists={checklists}
                            onUpdateChecklists={handleUpdateChecklists}
                        />
                        <TaskNotes
                            cardId={card.id}
                            notes={notes}
                            onUpdateNotes={handleUpdateNotes}
                            isDisabled={!isNotesEnabled}
                        />
                    </div>

                    <div className="w-1/2">
                        <PriorityDropdown priority={priority} onChange={handlePriorityChange} />
                        <DifficultyDropdown difficulty={difficulty} onChange={handleDifficultyChange} />
                        <LearningStrategiesDropdown strategy={learningStrategy} onChange={handleLearningStrategyChange} />

                        <div className="mt-4">
                            <h3 className="font-semibold">Rate Your Learning:</h3>
                            <StarRating rating={rating} onRate={handleRatingChange} isDisabled={!isRatingEnabled} />
                        </div>
                    </div>
                </div>

                {/* Buttons Layout */}
                <div className="flex items-center gap-4 mt-4">
                    <button
                        onClick={onClose}
                        className="w-[40%] bg-gray-300 text-gray-800 py-3 rounded hover:bg-gray-400"
                    >
                        Close
                    </button>

                    <button
                        onClick={() => onArchive(card.id)}
                        className="w-[40%] bg-red-500 text-white py-3 rounded hover:bg-red-600"
                    >
                        Archive
                    </button>

                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this task? This action cannot be undone by you.")) {
                                onDelete(card.id);
                            }
                        }}
                        className="w-[20%] bg-red-700 text-white py-3 rounded hover:bg-red-800"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

}   