"use client"

import { useState, useEffect } from "react"

interface TaskInfoProps {
    card: {
        id: string
        title: string
        sub_title: string
        description?: string
    }
    onUpdateTitle: (cardId: string, newTitle: string) => void
    onUpdateSubTitle: (cardId: string, newSubTitle: string) => void
    onUpdateDescription: (cardId: string, newDescription: string) => void
}

export default function TaskInfo({ card, onUpdateTitle, onUpdateSubTitle, onUpdateDescription }: TaskInfoProps) {
    const [title, setTitle] = useState(card.title)
    const [subTitle, setSubTitle] = useState(card.sub_title)
    const [description, setDescription] = useState(card.description || "")

    // Sync with props if card changes
    useEffect(() => {
        setTitle(card.title)
        setSubTitle(card.sub_title)
        setDescription(card.description || "")
    }, [card])

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle)
        onUpdateTitle(card.id, newTitle)
    }

    const handleSubTitleChange = (newSubTitle: string) => {
        setSubTitle(newSubTitle)
        onUpdateSubTitle(card.id, newSubTitle)
    }

    const handleDescriptionChange = (newDescription: string) => {
        setDescription(newDescription)
        onUpdateDescription(card.id, newDescription)
    }

    return (
        <div className="space-y-4">
            {/* Title */}
            <div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full text-xl font-semibold p-2 border border-indigo-300 dark:border-indigo-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm"
                    placeholder="Task Title"
                />
            </div>

            {/* Sub-title */}
            <div>
                <input
                    type="text"
                    value={subTitle}
                    onChange={(e) => handleSubTitleChange(e.target.value)}
                    className="w-full text-base p-2 border border-indigo-300 dark:border-indigo-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm"
                    placeholder="Sub-title"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-1">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="w-full min-h-[120px] border border-indigo-300 dark:border-indigo-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm"
                    placeholder="Add task details..."
                />
            </div>
        </div>
    )
}
