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
                <label className="block text-sm font-medium text-gray-700">Notes / Summary</label>
                {isDisabled && (
                    <div className="flex items-center text-amber-600 text-xs">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        Only editable in Reflection column
                    </div>
                )}
            </div>

            <div
                className={`relative rounded-md border ${isDisabled ? "bg-gray-50 border-gray-200" : "border-gray-300 hover:border-gray-400"}`}
            >
                {noteText.trim() === "" && (
                    <div className="absolute top-3 left-3 flex items-center text-gray-400 pointer-events-none">
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
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                    disabled={isDisabled}
                />
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500">
                <div>{noteText.length} characters</div>
                {!isDisabled && (
                    <button
                        onClick={() => handleNotesChange("")}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={noteText.length === 0}
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    )
}

