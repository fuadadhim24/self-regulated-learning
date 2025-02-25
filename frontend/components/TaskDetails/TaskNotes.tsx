import { useState, useEffect } from "react";

interface TaskNotesProps {
    cardId: string;
    notes?: string;
    onUpdateNotes: (cardId: string, newNotes: string) => void;
}

export default function TaskNotes({ cardId, notes = "", onUpdateNotes }: TaskNotesProps) {
    const [noteText, setNoteText] = useState(notes);

    useEffect(() => {
        setNoteText(notes);
    }, [notes]);

    const handleNotesChange = (newNotes: string) => {
        setNoteText(newNotes);
        onUpdateNotes(cardId, newNotes);
    };

    return (
        <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Notes / Summary</label>
            <textarea
                value={noteText}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="w-full border border-gray-300 rounded p-3"
                rows={5}
                placeholder="Write your notes or summary here..."
            />
        </div>
    );
}
