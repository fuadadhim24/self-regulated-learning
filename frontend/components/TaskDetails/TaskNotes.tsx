import { useState, useEffect } from "react";

interface TaskNotesProps {
    cardId: string;
    notes?: string;
    onUpdateNotes: (cardId: string, newNotes: string) => void;
    isDisabled?: boolean;
}

export default function TaskNotes({ cardId, notes = "", onUpdateNotes, isDisabled = false }: TaskNotesProps) {
    const [noteText, setNoteText] = useState(notes);

    useEffect(() => {
        setNoteText(notes);
    }, [notes]);

    const handleNotesChange = (newNotes: string) => {
        if (isDisabled) return; // Prevent updating when disabled
        setNoteText(newNotes);
        onUpdateNotes(cardId, newNotes);
    };

    return (
        <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Notes / Summary</label>
            <textarea
                value={noteText}
                onChange={(e) => handleNotesChange(e.target.value)}
                className={`w-full border rounded p-3 ${isDisabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "border-gray-300"
                    }`}
                rows={5}
                placeholder={isDisabled ? "Notes can only be edited in Reflection (Done) column" : "Write your notes or summary here..."}
                disabled={isDisabled} // Disables input when not in 4th column
            />
        </div>
    );
}
