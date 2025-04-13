"use client"

import { useState, useEffect } from "react"
import type { Checklists, ChecklistItem } from "@/types"
import { Plus, Trash2, Check, ChevronDown } from "lucide-react"

interface ChecklistProps {
    cardId: string
    checklists?: Checklists[]
    onUpdateChecklists: (updatedChecklists: Checklists[]) => void
}

export default function Checklist({ cardId, checklists = [], onUpdateChecklists }: ChecklistProps) {
    const [localChecklists, setLocalChecklists] = useState<Checklists[]>(checklists)
    const [showForm, setShowForm] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [newItemText, setNewItemText] = useState<{ [key: string]: string }>({}) // Track input per checklist
    const [collapsedLists, setCollapsedLists] = useState<{ [key: string]: boolean }>({})

    useEffect(() => {
        setLocalChecklists(checklists)
    }, [checklists])

    const handleAddChecklist = () => {
        if (newTitle.trim() === "") return

        const newChecklist: Checklists = {
            id: `${Date.now()}`,
            title: newTitle,
            items: [],
        }

        const updatedChecklists = [...localChecklists, newChecklist]
        setLocalChecklists(updatedChecklists)
        onUpdateChecklists(updatedChecklists)

        setNewTitle("")
        setShowForm(false)
    }

    const handleDeleteChecklist = (checklistId: string) => {
        const updatedChecklists = localChecklists.filter((list) => list.id !== checklistId)
        setLocalChecklists(updatedChecklists)
        onUpdateChecklists(updatedChecklists)
    }

    const handleAddItem = (checklistId: string) => {
        if (!newItemText[checklistId] || newItemText[checklistId].trim() === "") return

        const newItem: ChecklistItem = {
            id: `${Date.now()}`,
            text: newItemText[checklistId],
            completed: false,
        }

        const updatedChecklists = localChecklists.map((list) =>
            list.id === checklistId ? { ...list, items: [...list.items, newItem] } : list,
        )

        setLocalChecklists(updatedChecklists)
        onUpdateChecklists(updatedChecklists)

        // Clear input after adding item
        setNewItemText((prev) => ({ ...prev, [checklistId]: "" }))
    }

    const handleToggleItem = (checklistId: string, itemId: string) => {
        const updatedChecklists = localChecklists.map((list) =>
            list.id === checklistId
                ? {
                    ...list,
                    items: list.items.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
                }
                : list,
        )

        setLocalChecklists(updatedChecklists)
        onUpdateChecklists(updatedChecklists)
    }

    const handleDeleteItem = (checklistId: string, itemId: string) => {
        const updatedChecklists = localChecklists.map((list) =>
            list.id === checklistId
                ? {
                    ...list,
                    items: list.items.filter((item) => item.id !== itemId),
                }
                : list,
        )

        setLocalChecklists(updatedChecklists)
        onUpdateChecklists(updatedChecklists)
    }

    const calculateProgress = (items: ChecklistItem[]) => {
        if (items.length === 0) return 0
        const completed = items.filter((item) => item.completed).length
        return (completed / items.length) * 100
    }

    const toggleCollapse = (checklistId: string) => {
        setCollapsedLists((prev) => ({
            ...prev,
            [checklistId]: !prev[checklistId],
        }))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Checklists</h3>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Checklist
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Checklist Title"
                        className="w-full border border-gray-300 p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleAddChecklist}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md text-sm font-medium transition-colors"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="py-1.5 px-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {localChecklists.length === 0 && !showForm && (
                <div className="text-center py-6 text-gray-500 text-sm">No checklists yet. Add one to track your progress.</div>
            )}

            {localChecklists.map((list) => (
                <div key={list.id} className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200">
                        <div className="flex justify-between items-center p-3">
                            <button
                                className="flex items-center gap-2 font-medium text-gray-800 hover:text-gray-600 flex-1 text-left"
                                onClick={() => toggleCollapse(list.id)}
                            >
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform ${collapsedLists[list.id] ? "rotate-180" : ""}`}
                                />
                                {list.title}
                                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 ml-2">
                                    {list.items.filter((item) => item.completed).length}/{list.items.length}
                                </span>
                            </button>
                            <button
                                onClick={() => handleDeleteChecklist(list.id)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 h-1">
                            <div className="bg-green-500 h-1" style={{ width: `${calculateProgress(list.items)}%` }}></div>
                        </div>
                    </div>

                    {!collapsedLists[list.id] && (
                        <div className="p-3">
                            {/* Checklist Items */}
                            {list.items.length > 0 ? (
                                <ul className="space-y-2 mb-3">
                                    {list.items.map((item) => (
                                        <li key={item.id} className="flex items-start justify-between group">
                                            <div className="flex items-start">
                                                <div
                                                    className={`flex-shrink-0 w-5 h-5 rounded border ${item.completed ? "bg-blue-500 border-blue-500" : "border-gray-300"} flex items-center justify-center cursor-pointer mt-0.5`}
                                                    onClick={() => handleToggleItem(list.id, item.id)}
                                                >
                                                    {item.completed && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                                <span
                                                    className={`ml-2 text-sm ${item.completed ? "line-through text-gray-500" : "text-gray-700"}`}
                                                >
                                                    {item.text}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteItem(list.id, item.id)}
                                                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label="Delete item"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm py-2">No items in this checklist yet.</p>
                            )}

                            {/* Add Item Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newItemText[list.id] || ""}
                                    onChange={(e) => setNewItemText({ ...newItemText, [list.id]: e.target.value })}
                                    placeholder="Add an item"
                                    className="flex-1 border border-gray-300 p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleAddItem(list.id)
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => handleAddItem(list.id)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

