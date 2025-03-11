"use client"

import { useEffect, useState } from "react"
import { getProgressReport } from "@/utils/api"
import { Pie, Bar } from "react-chartjs-2"
import { X } from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

interface ProgressReport {
    total_cards: number
    done_cards: number
    progress_percentage: number
    list_report: Record<string, number>
}

interface DashboardModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DashboardModal({ isOpen, onClose }: DashboardModalProps) {
    const [progress, setProgress] = useState<ProgressReport | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return

        const fetchProgressReport = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    setError("User not authenticated")
                    return
                }

                const response = await getProgressReport(token)

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Failed to fetch progress report")
                }

                const data: ProgressReport = await response.json()
                setProgress(data)
            } catch (err: any) {
                setError(err.message)
            }
        }

        fetchProgressReport()
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Analytics Dashboard</h2>
                    <button
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                            <p className="font-medium">Error</p>
                            <p>{error}</p>
                        </div>
                    ) : !progress ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Progress Summary */}
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Progress Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Cards</p>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{progress.total_cards}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{progress.done_cards}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Completion Rate</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {progress.progress_percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pie Chart */}
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Completion Status</h3>
                                    <div className="h-64 flex items-center justify-center">
                                        <Pie
                                            data={{
                                                labels: ["Completed", "Remaining"],
                                                datasets: [
                                                    {
                                                        data: [progress.done_cards, progress.total_cards - progress.done_cards],
                                                        backgroundColor: ["#10b981", "#f59e0b"],
                                                        borderWidth: 1,
                                                        borderColor: ["#10b981", "#f59e0b"],
                                                    },
                                                ],
                                            }}
                                            options={{
                                                plugins: {
                                                    legend: {
                                                        position: "bottom",
                                                        labels: {
                                                            color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Bar Chart */}
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Cards Per Column</h3>
                                    <div className="h-64">
                                        <Bar
                                            data={{
                                                labels: Object.keys(progress.list_report),
                                                datasets: [
                                                    {
                                                        label: "Number of Cards",
                                                        data: Object.values(progress.list_report),
                                                        backgroundColor: "#3b82f6",
                                                        borderRadius: 4,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                        },
                                                        grid: {
                                                            color: document.documentElement.classList.contains("dark")
                                                                ? "rgba(255, 255, 255, 0.1)"
                                                                : "rgba(0, 0, 0, 0.1)",
                                                        },
                                                    },
                                                    x: {
                                                        ticks: {
                                                            color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                        },
                                                        grid: {
                                                            display: false,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

