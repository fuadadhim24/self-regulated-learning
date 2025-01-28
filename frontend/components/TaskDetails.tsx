import { useState } from 'react';

interface TaskDetailsProps {
    listName: string;
    card: {
        id: string;
        content: string;
        description?: string;
        difficulty: 'easy' | 'medium' | 'hard';
    };
    onClose: () => void;
    onUpdateDescription: (cardId: string, newDescription: string) => void;
    onUpdateDifficulty: (cardId: string, newDifficulty: 'easy' | 'medium' | 'hard') => void;
    onUpdateTaskName: (cardId: string, newName: string) => void;
}

export default function TaskDetails({
    listName,
    card,
    onClose,
    onUpdateDescription,
    onUpdateDifficulty,
    onUpdateTaskName,
}: TaskDetailsProps) {
    const [description, setDescription] = useState(card.description || '');
    const [difficulty, setDifficulty] = useState(card.difficulty);
    const [taskName, setTaskName] = useState(card.content);
    const [isToggleOn, setIsToggleOn] = useState(false); // State for start/stop toggle
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Tracks dropdown visibility

    const handleUpdateTaskName = () => {
        onUpdateTaskName(card.id, taskName);
    };

    const handleUpdateDescription = () => {
        onUpdateDescription(card.id, description);
    };

    const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
        setDifficulty(newDifficulty);
        onUpdateDifficulty(card.id, newDifficulty);
        setIsDropdownOpen(false);
    };

    const toggleStartStop = () => {
        setIsToggleOn(!isToggleOn);
    };

    const getColorForDifficulty = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'hard':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 w-[600px]">
                {/* Task Name */}
                <h2 className="text-2xl font-bold text-center mb-6">
                    <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        onBlur={handleUpdateTaskName}
                        className="w-full text-center font-bold text-2xl p-2 border rounded"
                    />
                </h2>

                {/* Description */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleUpdateDescription}
                        className="w-full border border-gray-300 rounded p-3"
                        rows={5}
                    />
                </div>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Start/Stop Toggle Button */}
                    <div className="flex items-center">
                        <div
                            onClick={toggleStartStop}
                            className={`relative w-16 h-8 rounded-full cursor-pointer transition-colors ${isToggleOn ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isToggleOn ? 'transform translate-x-8' : ''
                                    }`}
                            />
                        </div>
                        <span className="ml-4 text-gray-700 font-semibold">
                            {isToggleOn ? 'Stop' : 'Start'}
                        </span>
                    </div>

                    {/* Difficulty Dropdown */}
                    <div className="relative flex justify-end">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Difficulty</label>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full text-left py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring ${getColorForDifficulty(difficulty)
                                    } text-white`}
                            >
                                {difficulty.toUpperCase()}
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-md z-10">
                                    {['easy', 'medium', 'hard'].map((level) => (
                                        <div
                                            key={level}
                                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${getColorForDifficulty(level)
                                                } text-white rounded`}
                                            onClick={() =>
                                                handleDifficultyChange(level as 'easy' | 'medium' | 'hard')
                                            }
                                        >
                                            {level.toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="mt-8 block w-full bg-gray-300 text-gray-800 py-3 rounded hover:bg-gray-400"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
