"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Clock, AlertTriangle, AlertCircle } from "lucide-react"

interface PriorityDropdownProps {
    priority: "low" | "medium" | "high" | "critical"
    onChange: (newPriority: "low" | "medium" | "high" | "critical") => void
}

export default function PriorityDropdown({ priority, onChange }: PriorityDropdownProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const priorityOptions = [
        {
            value: "low",
            label: "Low",
            icon: <Clock className="h-4 w-4" />,
            color: "bg-teal-100 text-teal-800 border-teal-200",
            description: "Can be completed when time allows",
        },
        {
            value: "medium",
            label: "Medium",
            icon: <Clock className="h-4 w-4" />,
            color: "bg-green-100 text-green-800 border-green-200",
            description: "Should be completed soon",
        },
        {
            value: "high",
            label: "High",
            icon: <AlertTriangle className="h-4 w-4" />,
            color: "bg-amber-100 text-amber-800 border-amber-200",
            description: "Important task that needs attention",
        },
        {
            value: "critical",
            label: "Critical",
            icon: <AlertCircle className="h-4 w-4" />,
            color: "bg-red-100 text-red-800 border-red-200",
            description: "Urgent task requiring immediate action",
        },
    ]

    const selectedOption = priorityOptions.find((option) => option.value === priority) || priorityOptions[0]

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-1.5">
                Priority
            </label>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-indigo-300 dark:border-indigo-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:border-indigo-400 dark:hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                aria-label={`Current priority: ${priority}`}
            >
                <div className={`flex items-center ${selectedOption.color} px-2.5 py-1 rounded-md`}>
                    {selectedOption.icon}
                    <span className="ml-1.5 font-medium">{selectedOption.label}</span>
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-indigo-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-md shadow-lg overflow-hidden">
                    <div className="py-1">
                        {priorityOptions.map((option) => (
                            <button
                                key={option.value}
                                className={`flex flex-col w-full px-3 py-2 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors ${priority === option.value ? "bg-indigo-50 dark:bg-indigo-900/30" : ""}`}
                                onClick={() => {
                                    onChange(option.value as "low" | "medium" | "high" | "critical")
                                    setIsDropdownOpen(false)
                                }}
                                aria-label={`Set priority to ${option.label}`}
                            >
                                <div className="flex items-center">
                                    <div className={`flex items-center ${option.color} px-2 py-1 rounded-md`}>
                                        {option.icon}
                                        <span className="ml-1.5 font-medium">{option.label}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{option.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
