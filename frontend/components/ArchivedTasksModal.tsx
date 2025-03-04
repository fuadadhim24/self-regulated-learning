import React from "react";
import { Card } from "@/types";

interface ArchivedTasksModalProps {
    archivedTasks: Card[];
    onClose: () => void;
    onRestore: (cardId: string) => void;
    onDelete: (cardId: string) => void;
}

export default function ArchivedTasksModal({ archivedTasks, onClose, onRestore, onDelete }: ArchivedTasksModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Archived Tasks</h2>

                {archivedTasks.length === 0 ? (
                    <p className="text-gray-600">No archived tasks</p>
                ) : (
                    <ul className="space-y-4">
                        {archivedTasks.map((task) => (
                            <li key={task.id} className="border p-4 rounded-lg bg-gray-100 shadow-sm">
                                {/* Header */}
                                <div className="mb-2">
                                    <h3 className="font-semibold text-lg">{task.title}</h3>
                                    {task.sub_title && (
                                        <p className="text-sm text-gray-600 italic">{task.sub_title}</p>
                                    )}
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                    <p><strong>Priority:</strong> {capitalize(task.priority)}</p>
                                    <p><strong>Difficulty:</strong> {capitalize(task.difficulty)}</p>
                                    <p><strong>Rating:</strong> {task.rating !== undefined ? `${task.rating} ⭐` : "N/A"}</p>
                                </div>

                                {/* Description */}
                                {task.description && (
                                    <p className="mt-2 text-sm text-gray-600">{task.description}</p>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                        onClick={() => onRestore(task.id)}
                                    >
                                        Restore
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        onClick={() => {
                                            if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                                                onDelete(task.id);
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <button onClick={onClose} className="mt-6 bg-blue-500 text-white px-4 py-2 rounded w-full">
                    Close
                </button>
            </div>
        </div>
    );
}

/**
 * Capitalizes the first letter of a string.
 */
function capitalize(text?: string): string {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "N/A";
}
