import { useState } from 'react';

interface DifficultyDropdownProps {
    difficulty: 'easy' | 'medium' | 'hard';
    onChange: (newDifficulty: 'easy' | 'medium' | 'hard') => void;
}

export default function DifficultyDropdown({ difficulty, onChange }: DifficultyDropdownProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const getColorForDifficulty = (level: string) => {
        switch (level) {
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
        <div className="relative mb-4 ml-4 w-40">
            <label className="block text-gray-700 font-semibold mb-2">Difficulty</label>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full text-left py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring ${getColorForDifficulty(
                    difficulty
                )} text-white`}
            >
                {difficulty.toUpperCase()}
            </button>
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-300 rounded shadow-md z-10">
                    {['easy', 'medium', 'hard'].map((level) => (
                        <div
                            key={level}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${getColorForDifficulty(level)} text-white`}
                            onClick={() => {
                                onChange(level as 'easy' | 'medium' | 'hard');
                                setIsDropdownOpen(false);
                            }}
                        >
                            {level.toUpperCase()}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
