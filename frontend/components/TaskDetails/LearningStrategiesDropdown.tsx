"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, BookOpen, FileText, Network, Brain, Clock, Users, Loader2 } from "lucide-react"
import { getAllLearningStrategies } from "@/utils/api"
import type { LearningStrategy } from "@/types"

interface LearningStrategiesDropdownProps {
    strategy: string
    onChange: (newStrategy: string) => void
}

export default function LearningStrategiesDropdown({ strategy, onChange }: LearningStrategiesDropdownProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [strategies, setStrategies] = useState<LearningStrategy[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
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

    useEffect(() => {
        const fetchStrategies = async () => {
            try {
                setLoading(true)
                setError(null)
                const token = localStorage.getItem("token")
                if (!token) {
                    setError("No token found. Please log in.")
                    return
                }

                const response = await getAllLearningStrategies()
                if (!response.ok) {
                    throw new Error(`Failed to fetch learning strategies: ${response.status} ${response.statusText}`)
                }

                const data = await response.json()
                const mappedStrategies = data.map((strategy: any) => ({
                    id: strategy._id || strategy.id,
                    name: strategy.learning_strat_name || strategy.name,
                    description: strategy.description,
                }))
                setStrategies(mappedStrategies)
            } catch (err: any) {
                console.error("Error fetching strategies:", err)
                setError(err.message || "An error occurred while fetching strategies")
            } finally {
                setLoading(false)
            }
        }

        fetchStrategies()
    }, [])

    const selectedStrategy = strategies.find((s) => s.name === strategy) || strategies[0]

    const getStrategyIcon = (name: string) => {
        const lowerName = name.toLowerCase()
        if (lowerName.includes("rehearsal")) return <BookOpen className="h-4 w-4" />
        if (lowerName.includes("elaboration")) return <FileText className="h-4 w-4" />
        if (lowerName.includes("organization")) return <Network className="h-4 w-4" />
        if (lowerName.includes("metacognitive")) return <Brain className="h-4 w-4" />
        if (lowerName.includes("time")) return <Clock className="h-4 w-4" />
        if (lowerName.includes("help")) return <Users className="h-4 w-4" />
        return <BookOpen className="h-4 w-4" />
    }

    const getStrategyColor = (name: string) => {
        const lowerName = name.toLowerCase()
        if (lowerName.includes("rehearsal")) return "bg-blue-100 text-blue-800 border-blue-200"
        if (lowerName.includes("elaboration")) return "bg-green-100 text-green-800 border-green-200"
        if (lowerName.includes("organization")) return "bg-purple-100 text-purple-800 border-purple-200"
        if (lowerName.includes("metacognitive")) return "bg-indigo-100 text-indigo-800 border-indigo-200"
        if (lowerName.includes("time")) return "bg-amber-100 text-amber-800 border-amber-200"
        if (lowerName.includes("help")) return "bg-red-100 text-red-800 border-red-200"
        return "bg-gray-100 text-gray-800 border-gray-200"
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-1.5">
                Learning Strategy
            </label>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-indigo-300 dark:border-indigo-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:border-indigo-400 dark:hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                aria-label={`Current learning strategy: ${strategy}`}
            >
                <div className="flex items-center">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    ) : selectedStrategy ? (
                        <>
                            <div className={`p-1.5 rounded-md ${getStrategyColor(selectedStrategy.name)}`}>
                                {getStrategyIcon(selectedStrategy.name)}
                            </div>
                            <div className="ml-2 text-left">
                                <div className="font-medium text-sm">{selectedStrategy.name}</div>
                                {selectedStrategy.description && (
                                    <div className="text-xs text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">
                                        {selectedStrategy.description}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-indigo-500 dark:text-indigo-400">Select a strategy</div>
                    )}
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-indigo-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-md shadow-lg overflow-hidden">
                    <div className="py-1 max-h-[300px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            </div>
                        ) : error ? (
                            <div className="px-3 py-2 text-sm text-red-500">{error}</div>
                        ) : strategies.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-indigo-500 dark:text-indigo-400">No strategies available</div>
                        ) : (
                            strategies.map((strat) => (
                                <button
                                    key={strat.id}
                                    className={`flex items-center w-full px-3 py-2 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors ${strategy === strat.name ? "bg-indigo-50 dark:bg-indigo-900/30" : ""}`}
                                    onClick={() => {
                                        onChange(strat.name)
                                        setIsDropdownOpen(false)
                                    }}
                                    aria-label={`Set learning strategy to ${strat.name}`}
                                >
                                    <div className={`p-1.5 rounded-md ${getStrategyColor(strat.name)}`}>
                                        {getStrategyIcon(strat.name)}
                                    </div>
                                    <div className="ml-2 text-left">
                                        <div className="font-medium text-sm">{strat.name}</div>
                                        {strat.description && (
                                            <div className="text-xs text-indigo-600 dark:text-indigo-400">{strat.description}</div>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
