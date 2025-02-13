import { useState } from 'react';

interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

interface ChecklistProps {
    cardId: string;
}

export default function Checklist({ cardId }: ChecklistProps) {
    const [checklists, setChecklists] = useState<{ id: string; title: string; items: ChecklistItem[] }[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const handleAddChecklist = () => {
        if (newTitle.trim() === '') return;

        const newChecklist = {
            id: `${Date.now()}`, // simple unique ID
            title: newTitle,
            items: [],
        };

        setChecklists((prev) => [...prev, newChecklist]);
        setNewTitle('');
        setShowForm(false);
    };

    const handleDeleteChecklist = (checklistId: string) => {
        setChecklists((prev) => prev.filter((list) => list.id !== checklistId));
    };

    const handleAddItem = (checklistId: string) => {
        const newItem = { id: `${Date.now()}`, text: 'New Item', completed: false };
        setChecklists((prev) =>
            prev.map((list) =>
                list.id === checklistId ? { ...list, items: [...list.items, newItem] } : list
            )
        );
    };

    const handleToggleItem = (checklistId: string, itemId: string) => {
        setChecklists((prev) =>
            prev.map((list) =>
                list.id === checklistId
                    ? {
                        ...list,
                        items: list.items.map((item) =>
                            item.id === itemId ? { ...item, completed: !item.completed } : item
                        ),
                    }
                    : list
            )
        );
    };

    const calculateProgress = (items: ChecklistItem[]) => {
        if (items.length === 0) return 0;
        const completed = items.filter((item) => item.completed).length;
        return (completed / items.length) * 100;
    };

    return (
        <div className="mb-4">
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Add Checklist
                </button>
            )}

            {showForm && (
                <div className="mt-2">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Checklist Title"
                        className="w-full border p-2 rounded"
                    />
                    <button
                        onClick={handleAddChecklist}
                        className="w-full mt-2 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                    >
                        Add
                    </button>
                </div>
            )}

            {checklists.map((list) => (
                <div key={list.id} className="mt-4 p-3 border rounded shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{list.title}</h3>
                        <button
                            onClick={() => handleDeleteChecklist(list.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            Delete
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-300 rounded h-2 mb-2">
                        <div
                            className="bg-green-500 h-2 rounded"
                            style={{ width: `${calculateProgress(list.items)}%` }}
                        ></div>
                    </div>

                    {/* Checklist Items */}
                    <ul>
                        {list.items.map((item) => (
                            <li key={item.id} className="flex items-center mb-1">
                                <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => handleToggleItem(list.id, item.id)}
                                    className="mr-2"
                                />
                                <span className={item.completed ? 'line-through text-gray-500' : ''}>
                                    {item.text}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleAddItem(list.id)}
                        className="w-full mt-2 bg-gray-500 text-white py-1 rounded hover:bg-gray-600"
                    >
                        Add Item
                    </button>
                </div>
            ))}
        </div>
    );
}
