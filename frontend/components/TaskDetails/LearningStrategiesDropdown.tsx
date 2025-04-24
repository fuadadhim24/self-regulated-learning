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
                    description: strategy.description
                }))
                setStrategies(mappedStrategies)
            } catch (err: any) {
                console.error('Error fetching strategies:', err)
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
        if (lowerName.includes('rehearsal')) return <BookOpen className="h-4 w-4" />
        if (lowerName.includes('elaboration')) return <FileText className="h-4 w-4" />
        if (lowerName.includes('organization')) return <Network className="h-4 w-4" />
        if (lowerName.includes('metacognitive')) return <Brain className="h-4 w-4" />
        if (lowerName.includes('time')) return <Clock className="h-4 w-4" />
        if (lowerName.includes('help')) return <Users className="h-4 w-4" />
        return <BookOpen className="h-4 w-4" />
    }

    const getStrategyColor = (name: string) => {
        const lowerName = name.toLowerCase()
        if (lowerName.includes('rehearsal')) return "bg-blue-100 text-blue-800 border-blue-200"
        if (lowerName.includes('elaboration')) return "bg-green-100 text-green-800 border-green-200"
        if (lowerName.includes('organization')) return "bg-purple-100 text-purple-800 border-purple-200"
        if (lowerName.includes('metacognitive')) return "bg-indigo-100 text-indigo-800 border-indigo-200"
        if (lowerName.includes('time')) return "bg-amber-100 text-amber-800 border-amber-200"
        if (lowerName.includes('help')) return "bg-red-100 text-red-800 border-red-200"
        return "bg-gray-100 text-gray-800 border-gray-200"
    }

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
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : selectedStrategy ? (
                        <>
                            <div className={`p-1.5 rounded-md ${getStrategyColor(selectedStrategy.name)}`}>
                                {getStrategyIcon(selectedStrategy.name)}
                            </div>
                            <div className="ml-2 text-left">
                                <div className="font-medium text-sm">{selectedStrategy.name}</div>
                                {selectedStrategy.description && (
                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                        {selectedStrategy.description}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-gray-500">Select a strategy</div>
                    )}
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                    <div className="py-1 max-h-[300px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="px-3 py-2 text-sm text-red-500">{error}</div>
                        ) : strategies.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">No strategies available</div>
                        ) : (
                            strategies.map((strat) => (
                                <button
                                    key={strat.id}
                                    className={`flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${strategy === strat.name ? "bg-gray-50" : ""}`}
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
                                            <div className="text-xs text-gray-500">{strat.description}</div>
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

