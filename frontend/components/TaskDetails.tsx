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
    onUpdateDifficulty: (cardId: string, newDifficulty: 'easy' | 'medium' | 'hard') => void
}

export default function TaskDetails({ listName, card, onClose, onUpdateDescription, onUpdateDifficulty }: TaskDetailsProps) {
    const [description, setDescription] = useState(card.description || '')
    const [difficulty, setDifficulty] = useState(card.difficulty)
    const [showDropdown, setShowDropdown] = useState(false)
    const [isEditing, setIsEditing] = useState(false) // Track if the description is being edited

    const handleUpdateDescription = () => {
        onUpdateDescription(card.id, description)
        setIsEditing(false) // Stop editing after saving
    }

    const handleCancelEdit = () => {
        setDescription(card.description || '') // Reset the description to its original value
        setIsEditing(false) // Stop editing when canceling
    }

    const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
        setDifficulty(newDifficulty)
        onUpdateDifficulty(card.id, newDifficulty)
        setShowDropdown(false)
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

                {/* Difficulty Section */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Difficulty</label>
                    <div
                        className={`inline-block py-1 px-3 rounded text-white cursor-pointer ${getColorForDifficulty(difficulty)}`}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        {difficulty.toUpperCase()}
                    </div>
                    {showDropdown && (
                        <div className="absolute bg-white border mt-1 rounded shadow-lg">
                            {['easy', 'medium', 'hard'].map((level) => (
                                <div
                                    key={level}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleDifficultyChange(level as 'easy' | 'medium' | 'hard')}
                                >
                                    {level.toUpperCase()}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Description Section */}
                <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-700 font-semibold">Description:</p>
                    {!isEditing ? (
                        // Display the description as plain text with the Edit button on the right
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-blue-500 hover:underline"
                        >
                            Edit
                        </button>
                    ) : (
                        <></>
                    )}
                </div>

                {!isEditing ? (
                    // Plain text description with border
                    <p className="mb-4 p-4 border border-gray-300 rounded">{description}</p>
                ) : (
                    // Textarea for editing the description with border
                    <>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 mb-4"
                            rows={4}
                        />
                        <div className="flex space-x-4">
                            <button
                                onClick={handleUpdateDescription}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}

                {/* Close Button */}
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
