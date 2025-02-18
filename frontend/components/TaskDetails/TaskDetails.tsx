"use client"

import { useState } from "react"
import TaskInfo from "./TaskInfo"
import StartStopToggle from "./StartStopToggle"
import DifficultyDropdown from "./DifficultyDropdown"
import PriorityDropdown from "./PriorityDropdown"
import Checklist from "./Checklist"
import LearningStrategiesDropdown from "./LearningStrategiesDropdown"

interface TaskDetailsProps {
    listName: string
    card: {
        id: string
        title: string
        sub_title: string
        description?: string
        difficulty: "easy" | "medium" | "hard"
        priority: "low" | "medium" | "high"
        learning_strategy: string
    }
    onClose: () => void
    onUpdateTitle: (cardId: string, newTitle: string) => void
    onUpdateSubTitle: (cardId: string, newSubTitle: string) => void
    onUpdateDescription: (cardId: string, newDescription: string) => void
    onUpdateDifficulty: (cardId: string, newDifficulty: "easy" | "medium" | "hard") => void
    onUpdatePriority: (cardId: string, newPriority: "low" | "medium" | "high") => void
    onUpdateLearningStrategy: (cardId: string, newLearningStrategy: string) => void
}

export default function TaskDetails({
    card,
    onClose,
    onUpdateTitle,
    onUpdateSubTitle,
    onUpdateDescription,
    onUpdateDifficulty,
    onUpdatePriority,
    onUpdateLearningStrategy,
}: TaskDetailsProps) {
    const [isToggleOn, setIsToggleOn] = useState(false)
    const [difficulty, setDifficulty] = useState(card.difficulty)
    const [priority, setPriority] = useState(card.priority)
    const [learningStrategy, setLearningStrategy] = useState("Learning Strategy 1") // Default value

    const handleToggle = () => {
        setIsToggleOn(!isToggleOn)
    }

    const handleDifficultyChange = (newDifficulty: "easy" | "medium" | "hard") => {
        setDifficulty(newDifficulty)
        onUpdateDifficulty(card.id, newDifficulty)
    }

    const handlePriorityChange = (newPriority: "low" | "medium" | "high") => {
        setPriority(newPriority)
        onUpdatePriority(card.id, newPriority)
    }

    const handleLearningStrategyChange = (newLearningStrategy: string) => {
        setLearningStrategy(newLearningStrategy)
        onUpdateLearningStrategy(card.id, newLearningStrategy)
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
                        <Checklist cardId={card.id} />
                    </div>

                    <div className="w-1/2">
                        <PriorityDropdown priority={priority} onChange={handlePriorityChange} />
                        <DifficultyDropdown difficulty={difficulty} onChange={handleDifficultyChange} />
                        <LearningStrategiesDropdown strategy={learningStrategy} onChange={handleLearningStrategyChange} />
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 block w-full bg-gray-300 text-gray-800 py-3 rounded hover:bg-gray-400"
                >
                    Close
                </button>
            </div>
        </div>
    )
}