"use client"

import { useState, useRef, useEffect } from "react"

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

    const getColorForPriority = (level: string) => {
        switch (level) {
            case "low":
                return "bg-[#31a38b]"
            case "medium":
                return "bg-green-500"
            case "high":
                return "bg-yellow-500"
            case "critical":
                return "bg-red-500"
            default:
                return "bg-gray-300"
        }
    }

    return (
        <div className="relative mb-4 w-full max-w-xs" ref={dropdownRef}>
            <label className="block text-gray-700 font-semibold mb-2">Priority</label>
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    aria-label={`Current priority: ${priority}`}
                >
                    <div className={`flex-grow h-8 rounded-md ${getColorForPriority(priority)}`} aria-hidden="true"></div>
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
                        {["low", "medium", "high", "critical"].map((level) => (
                            <button
                                key={level}
                                className="flex items-center w-full p-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                                onClick={() => {
                                    onChange(level as "low" | "medium" | "high" | "critical");
                                    setIsDropdownOpen(false)
                                }}
                                aria-label={`Set priority to ${level}`}
                            >
                                <div className={`flex-grow h-8 rounded-md ${getColorForPriority(level)}`} aria-hidden="true"></div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

