"use client"

import { useState, useEffect } from "react"
import { FileText, AlertCircle } from "lucide-react"

interface TaskNotesProps {
    cardId: string
    notes?: string
    onUpdateNotes: (cardId: string, newNotes: string) => void
    isDisabled?: boolean
}

export default function TaskNotes({ cardId, notes = "", onUpdateNotes, isDisabled = false }: TaskNotesProps) {
    const [noteText, setNoteText] = useState(notes)

    useEffect(() => {
        setNoteText(notes)
    }, [notes])

    const handleNotesChange = (newNotes: string) => {
        if (isDisabled) return // Prevent updating when disabled
        setNoteText(newNotes)
        onUpdateNotes(cardId, newNotes)
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    Notes / Summary
                </label>
                {isDisabled && (
                    <div className="flex items-center text-amber-600 dark:text-amber-500 text-xs">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        Only editable in Controlling (Review) or Reflection (Done) column
                    </div>
                )}
            </div>

            <div
                className={`relative rounded-md border ${isDisabled ? "bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-gray-700" : "border-indigo-300 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-600"}`}
            >
                {noteText.trim() === "" && (
                    <div className="absolute top-3 left-3 flex items-center text-gray-400 dark:text-gray-500 pointer-events-none">
                        <FileText className="h-5 w-5 mr-2 opacity-70" />
                        <span>
                            {isDisabled
                                ? "Notes can only be edited in Reflection (Done) column"
                                : "Write your notes or summary here..."}
                        </span>
                    </div>
                )}
                <textarea
                    value={noteText}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    className={`w-full rounded-md p-3 min-h-[120px] bg-transparent ${isDisabled
                        ? "text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        }`}
                    disabled={isDisabled}
                />
            </div>

            <div className="flex justify-between items-center text-xs text-indigo-600 dark:text-indigo-400">
                <div>{noteText.length} characters</div>
                {!isDisabled && (
                    <button
                        onClick={() => handleNotesChange("")}
                        className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300"
                        disabled={noteText.length === 0}
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    )
}
