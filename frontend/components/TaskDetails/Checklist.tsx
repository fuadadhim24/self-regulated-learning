import { useState, useEffect } from "react";
import { Checklists, ChecklistItem } from "@/types";

interface ChecklistProps {
    cardId: string;
    checklists?: Checklists[];
    onUpdateChecklists: (updatedChecklists: Checklists[]) => void;
}

export default function Checklist({ cardId, checklists = [], onUpdateChecklists }: ChecklistProps) {
    const [localChecklists, setLocalChecklists] = useState<Checklists[]>(checklists);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newItemText, setNewItemText] = useState<{ [key: string]: string }>({}); // Track input per checklist

    useEffect(() => {
        setLocalChecklists(checklists);
    }, [checklists]);

    const handleAddChecklist = () => {
        if (newTitle.trim() === "") return;

        const newChecklist: Checklists = {
            id: `${Date.now()}`,
            title: newTitle,
            items: [],
        };

        const updatedChecklists = [...localChecklists, newChecklist];
        setLocalChecklists(updatedChecklists);
        onUpdateChecklists(updatedChecklists);

        setNewTitle("");
        setShowForm(false);
    };

    const handleDeleteChecklist = (checklistId: string) => {
        const updatedChecklists = localChecklists.filter((list) => list.id !== checklistId);
        setLocalChecklists(updatedChecklists);
        onUpdateChecklists(updatedChecklists);
    };

    const handleAddItem = (checklistId: string) => {
        if (!newItemText[checklistId] || newItemText[checklistId].trim() === "") return;

        const newItem: ChecklistItem = {
            id: `${Date.now()}`,
            text: newItemText[checklistId],
            completed: false,
        };

        const updatedChecklists = localChecklists.map((list) =>
            list.id === checklistId ? { ...list, items: [...list.items, newItem] } : list
        );

        setLocalChecklists(updatedChecklists);
        onUpdateChecklists(updatedChecklists);

        // Clear input after adding item
        setNewItemText((prev) => ({ ...prev, [checklistId]: "" }));
    };

    const handleToggleItem = (checklistId: string, itemId: string) => {
        const updatedChecklists = localChecklists.map((list) =>
            list.id === checklistId
                ? {
                    ...list,
                    items: list.items.map((item) =>
                        item.id === itemId ? { ...item, completed: !item.completed } : item
                    ),
                }
                : list
        );

        setLocalChecklists(updatedChecklists);
        onUpdateChecklists(updatedChecklists);
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

            {localChecklists.map((list) => (
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
                                <span className={item.completed ? "line-through text-gray-500" : ""}>
                                    {item.text}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Add Item Input */}
                    <div className="mt-2 flex">
                        <input
                            type="text"
                            value={newItemText[list.id] || ""}
                            onChange={(e) => setNewItemText({ ...newItemText, [list.id]: e.target.value })}
                            placeholder="New Item Name"
                            className="border p-2 flex-grow rounded"
                        />
                        <button
                            onClick={() => handleAddItem(list.id)}
                            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Add
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
