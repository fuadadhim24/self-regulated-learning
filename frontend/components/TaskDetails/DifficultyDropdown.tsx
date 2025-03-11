"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Zap, Dumbbell, Brain, Award } from "lucide-react"

interface DifficultyDropdownProps {
    difficulty: "easy" | "medium" | "hard" | "expert"
    onChange: (newDifficulty: "easy" | "medium" | "hard" | "expert") => void
}

export default function DifficultyDropdown({ difficulty, onChange }: DifficultyDropdownProps) {
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

    const difficultyOptions = [
        {
            value: "easy",
            label: "Easy",
            icon: <Zap className="h-4 w-4" />,
            color: "bg-blue-100 text-blue-800 border-blue-200",
            description: "Basic concepts, minimal effort required",
        },
        {
            value: "medium",
            label: "Medium",
            icon: <Dumbbell className="h-4 w-4" />,
            color: "bg-indigo-100 text-indigo-800 border-indigo-200",
            description: "Moderate complexity, requires focus",
        },
        {
            value: "hard",
            label: "Hard",
            icon: <Brain className="h-4 w-4" />,
            color: "bg-orange-100 text-orange-800 border-orange-200",
            description: "Complex concepts, significant effort needed",
        },
        {
            value: "expert",
            label: "Expert",
            icon: <Award className="h-4 w-4" />,
            color: "bg-purple-100 text-purple-800 border-purple-200",
            description: "Advanced material, mastery required",
        },
    ]

    const selectedOption = difficultyOptions.find((option) => option.value === difficulty) || difficultyOptions[0]

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                aria-label={`Current difficulty: ${difficulty}`}
            >
                <div className={`flex items-center ${selectedOption.color} px-2.5 py-1 rounded-md`}>
                    {selectedOption.icon}
                    <span className="ml-1.5 font-medium">{selectedOption.label}</span>
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                    <div className="py-1">
                        {difficultyOptions.map((option) => (
                            <button
                                key={option.value}
                                className={`flex flex-col w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${difficulty === option.value ? "bg-gray-50" : ""}`}
                                onClick={() => {
                                    onChange(option.value as "easy" | "medium" | "hard" | "expert")
                                    setIsDropdownOpen(false)
                                }}
                                aria-label={`Set difficulty to ${option.label}`}
                            >
                                <div className="flex items-center">
                                    <div className={`flex items-center ${option.color} px-2 py-1 rounded-md`}>
                                        {option.icon}
                                        <span className="ml-1.5 font-medium">{option.label}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

