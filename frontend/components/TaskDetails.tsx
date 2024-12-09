import { useState } from 'react'

interface TaskDetailsProps {
    listName: string
    card: {
        id: string
        content: string
        description?: string
        difficulty: 'easy' | 'medium' | 'hard'
    }
    onClose: () => void
    onUpdateDescription: (cardId: string, newDescription: string) => void
}

export default function TaskDetails({ listName, card, onClose, onUpdateDescription }: TaskDetailsProps) {
    const [description, setDescription] = useState(card.description || '')

    const handleUpdateDescription = () => {
        onUpdateDescription(card.id, description)
    }

    const getColorForDifficulty = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-500'
            case 'medium': return 'bg-yellow-500'
            case 'hard': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 w-96">
                <h2 className="text-xl font-bold mb-4">Task Details</h2>
                <p className="mb-2"><strong>In list:</strong> {listName}</p>
                <p className="mb-4"><strong>Description:</strong></p>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded p-2 mb-4"
                    rows={4}
                />
                <button
                    onClick={handleUpdateDescription}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Save Description
                </button>
                <div className={`mt-4 py-1 px-3 rounded text-white inline-block ${getColorForDifficulty(card.difficulty)}`}>
                    {card.difficulty.toUpperCase()}
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 block w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
                >
                    Close
                </button>
            </div>
        </div>
    )
}
