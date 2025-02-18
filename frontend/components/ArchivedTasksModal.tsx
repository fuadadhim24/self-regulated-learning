import React from "react";
import { Card } from "@/types";

interface ArchivedTasksModalProps {
    archivedTasks: Card[];
    onClose: () => void;
}

export default function ArchivedTasksModal({ archivedTasks, onClose }: ArchivedTasksModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-bold mb-4">Archived Tasks</h2>

                {archivedTasks.length === 0 ? (
                    <p>No archived tasks</p>
                ) : (
                    <ul className="max-h-60 overflow-y-auto">
                        {archivedTasks.map((task) => (
                            <li key={task.id} className="border p-2 rounded mb-2 bg-gray-100">
                                <h3 className="font-semibold">{task.title}</h3>
                                <p className="text-sm text-gray-600">{task.description}</p>
                            </li>
                        ))}
                    </ul>
                )}

                <button onClick={onClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                    Close
                </button>
            </div>
        </div>
    );
}
