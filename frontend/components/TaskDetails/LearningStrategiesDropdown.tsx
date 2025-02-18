"use client"

import { useState, useRef, useEffect } from "react"

interface LearningStrategiesDropdownProps {
    strategy: string
    onChange: (newStrategy: string) => void
}

export default function LearningStrategiesDropdown({ strategy, onChange }: LearningStrategiesDropdownProps) {
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

    const learningStrategies = ["Learning Strategy 1", "Learning Strategy 2", "Learning Strategy 3"]

    return (
        <div className="relative mb-4 w-full max-w-xs" ref={dropdownRef}>
            <label className="block text-gray-700 font-semibold mb-2">Learning Strategy</label>
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    aria-label={`Current learning strategy: ${strategy}`}
                >
                    <span className="flex-grow text-left">{strategy}</span>
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
                        {learningStrategies.map((strat) => (
                            <button
                                key={strat}
                                className="flex items-center w-full p-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                                onClick={() => {
                                    onChange(strat)
                                    setIsDropdownOpen(false)
                                }}
                                aria-label={`Set learning strategy to ${strat}`}
                            >
                                <span className="flex-grow text-left">{strat}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
