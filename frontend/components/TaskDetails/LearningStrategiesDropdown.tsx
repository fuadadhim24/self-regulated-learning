"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, BookOpen, FileText, Network, Brain, Clock, Users } from "lucide-react"

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

    const learningStrategies = [
        {
            value: "Rehearsal Strategies - Pengulangan Materi",
            label: "Rehearsal Strategies",
            description: "Pengulangan Materi",
            icon: <BookOpen className="h-4 w-4" />,
            color: "bg-blue-100 text-blue-800 border-blue-200",
        },
        {
            value: "Elaboration Strategies - Membuat Ringkasan dengan Kata Sendiri",
            label: "Elaboration Strategies",
            description: "Membuat Ringkasan dengan Kata Sendiri",
            icon: <FileText className="h-4 w-4" />,
            color: "bg-green-100 text-green-800 border-green-200",
        },
        {
            value: "Organization Strategies - Membuat Mind Map dan Outline",
            label: "Organization Strategies",
            description: "Membuat Mind Map dan Outline",
            icon: <Network className="h-4 w-4" />,
            color: "bg-purple-100 text-purple-800 border-purple-200",
        },
        {
            value: "Metacognitive Strategies - Evaluasi Hasil Belajar & Atur Strategi Belajar",
            label: "Metacognitive Strategies",
            description: "Evaluasi Hasil Belajar & Atur Strategi Belajar",
            icon: <Brain className="h-4 w-4" />,
            color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        },
        {
            value: "Time Management Strategies - Teknik Pomodoro",
            label: "Time Management Strategies",
            description: "Teknik Pomodoro",
            icon: <Clock className="h-4 w-4" />,
            color: "bg-amber-100 text-amber-800 border-amber-200",
        },
        {
            value: "Help-seeking Strategies - Belajar dengan AI & Platform Online",
            label: "Help-seeking Strategies",
            description: "Belajar dengan AI & Platform Online",
            icon: <Users className="h-4 w-4" />,
            color: "bg-red-100 text-red-800 border-red-200",
        },
    ]

    const selectedStrategy = learningStrategies.find((s) => s.value === strategy) || learningStrategies[0]

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Learning Strategy</label>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                aria-label={`Current learning strategy: ${strategy}`}
            >
                <div className="flex items-center">
                    <div className={`p-1.5 rounded-md ${selectedStrategy.color}`}>{selectedStrategy.icon}</div>
                    <div className="ml-2 text-left">
                        <div className="font-medium text-sm">{selectedStrategy.label}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{selectedStrategy.description}</div>
                    </div>
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                    <div className="py-1 max-h-[300px] overflow-y-auto">
                        {learningStrategies.map((strat) => (
                            <button
                                key={strat.value}
                                className={`flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${strategy === strat.value ? "bg-gray-50" : ""}`}
                                onClick={() => {
                                    onChange(strat.value)
                                    setIsDropdownOpen(false)
                                }}
                                aria-label={`Set learning strategy to ${strat.label}`}
                            >
                                <div className={`p-1.5 rounded-md ${strat.color}`}>{strat.icon}</div>
                                <div className="ml-2 text-left">
                                    <div className="font-medium text-sm">{strat.label}</div>
                                    <div className="text-xs text-gray-500">{strat.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

