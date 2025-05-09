"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { getProgressReport } from "@/utils/api"
import type { ProgressReport } from "./types"
import ProgressSummary from "./ProgressSummary"
import TaskDistribution from "./TaskDistribution"
import CoursePerformance from "./CoursePerformance"

interface DashboardModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DashboardModal({ isOpen, onClose }: DashboardModalProps) {
    const [progress, setProgress] = useState<ProgressReport | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "performance">("overview")

    useEffect(() => {
        if (isOpen) {
            const fetchProgress = async () => {
                try {
                    const response = await getProgressReport()
                    const data = await response.json()
                    setProgress(data)
                    setError(null)
                } catch (err) {
                    setError("Failed to load progress report")
                    console.error("Error fetching progress:", err)
                }
            }
            fetchProgress()
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Learning Dashboard</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "overview"
                            ? "bg-blue-500 text-white"
                            : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("tasks")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "tasks"
                            ? "bg-blue-500 text-white"
                            : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                    >
                        Task Distribution
                    </button>
                    <button
                        onClick={() => setActiveTab("performance")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "performance"
                            ? "bg-blue-500 text-white"
                            : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                    >
                        Course Performance
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error ? (
                        <div className="text-center text-red-500 dark:text-red-400">{error}</div>
                    ) : !progress ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activeTab === "overview" && <ProgressSummary progress={progress} />}
                            {activeTab === "tasks" && <TaskDistribution progress={progress} />}
                            {activeTab === "performance" && <CoursePerformance progress={progress} />}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
} 