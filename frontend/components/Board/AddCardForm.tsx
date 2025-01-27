import { useState } from 'react';

interface AddCardFormProps {
    onSubmit: (courseCode: string, courseName: string, material: string, difficulty: 'easy' | 'medium' | 'hard') => void;
    onCancel: () => void;
}

export default function AddCardForm({ onSubmit, onCancel }: AddCardFormProps) {
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    const [material, setMaterial] = useState('');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

    const handleSubmit = () => {
        if (courseCode && courseName && material) {
            onSubmit(courseCode, courseName, material, difficulty);
        }
    };

    return (
        <div className="bg-white p-4 rounded shadow-md">
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Course Code</label>
                <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Course Name</label>
                <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Material</label>
                <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full border rounded p-2"
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>
            <div className="flex justify-end space-x-2">
                <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleSubmit}
                >
                    Add Card
                </button>
            </div>
        </div>
    );
}
