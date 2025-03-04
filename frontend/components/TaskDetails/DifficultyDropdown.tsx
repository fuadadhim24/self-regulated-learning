"use client"

import { useState, useRef, useEffect } from "react"

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

    const getColorForDifficulty = (level: string) => {
        switch (level) {
            case "easy":
                return "bg-[#DADDFC]"
            case "medium":
                return "bg-[#537EC5]"
            case "hard":
                return "bg-[#F39422]"
            case "expert":
                return "bg-[#8F4426]"
            default:
                return "bg-gray-500"
        }
    }

    return (
        <div className="relative mb-4 w-full max-w-xs" ref={dropdownRef}>
            <label className="block text-gray-700 font-semibold mb-2">Difficulty</label>
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    aria-label={`Current difficulty: ${difficulty}`}
                >
                    <div className={`flex-grow h-8 rounded-md ${getColorForDifficulty(difficulty)}`} aria-hidden="true"></div>
                    <svg
                        className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
                        {["easy", "medium", "hard", "expert"].map((level) => (
                            <button
                                key={level}
                                className="flex items-center w-full p-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                                onClick={() => {
                                    onChange(level as "easy" | "medium" | "hard" | "expert");
                                    setIsDropdownOpen(false)
                                }}
                                aria-label={`Set difficulty to ${level}`}
                            >
                                <div className={`flex-grow h-8 rounded-md ${getColorForDifficulty(level)}`} aria-hidden="true"></div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

