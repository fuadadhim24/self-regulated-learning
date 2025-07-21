"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, BookOpen, FileText, Network, Brain, Clock, Users, Loader2 } from "lucide-react"
import { learningStrategyAPI } from "@/utils/apiClient"
import type { LearningStrategy as ApiLearningStrategy } from "@/types/api"
import { useToast } from "@/hooks/use-toast"

interface LearningStrategiesDropdownProps {
    selectedStrategy: string
    onStrategyChange: (newStrategy: string) => void
}

export default function LearningStrategiesDropdown({ selectedStrategy, onStrategyChange }: LearningStrategiesDropdownProps) {
    const [strategies, setStrategies] = useState<ApiLearningStrategy[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { toast } = useToast()

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
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
                const data = await learningStrategyAPI.getAllStrategies()
                setStrategies(data)
            } catch (err: any) {
                setError(err.message || "Failed to fetch learning strategies")
            } finally {
                setLoading(false)
            }
        }

        fetchStrategies()
    }, [])

    const selectedStrategyData = strategies.find(s => s._id === selectedStrategy)

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
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-indigo-300 dark:border-indigo-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:border-indigo-400 dark:hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={`Current learning strategy: ${selectedStrategyData?.learning_strat_name || "Select a strategy"}`}
            >
                <div className="flex items-center">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    ) : selectedStrategyData ? (
                        <>
                            <div className={`p-1.5 rounded-md ${getStrategyColor(selectedStrategyData.learning_strat_name)}`}>
                                {getStrategyIcon(selectedStrategyData.learning_strat_name)}
                            </div>
                            <div className="ml-2 text-left">
                                <div className="font-medium text-sm">{selectedStrategyData.learning_strat_name}</div>
                                {selectedStrategyData.description && (
                                    <div className="text-xs text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">
                                        {selectedStrategyData.description}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-indigo-500 dark:text-indigo-400">Select a strategy</div>
                    )}
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-indigo-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
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
                            strategies.map((strategy) => (
                                <button
                                    key={strategy._id}
                                    className={`flex items-center w-full px-3 py-2 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors ${selectedStrategy === strategy._id ? "bg-indigo-50 dark:bg-indigo-900/30" : ""}`}
                                    onClick={() => {
                                        onStrategyChange(strategy._id)
                                        setIsOpen(false)
                                    }}
                                    aria-label={`Set learning strategy to ${strategy.learning_strat_name}`}
                                >
                                    <div className={`p-1.5 rounded-md ${getStrategyColor(strategy.learning_strat_name)}`}>
                                        {getStrategyIcon(strategy.learning_strat_name)}
                                    </div>
                                    <div className="ml-2 text-left">
                                        <div className="font-medium text-sm">{strategy.learning_strat_name}</div>
                                        {strategy.description && (
                                            <div className="text-xs text-indigo-600 dark:text-indigo-400">{strategy.description}</div>
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
