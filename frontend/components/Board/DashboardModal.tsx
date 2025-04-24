"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getProgressReport } from "@/utils/api"
import { Bar, Doughnut } from "react-chartjs-2"
import { X, BarChart2, PieChart, Activity, Award, Layers } from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import { motion } from "framer-motion"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

interface ProgressReport {
    total_cards: number
    done_cards: number
    progress_percentage: number
    list_report: Record<string, number>
    strategy_stats: Record<
        string,
        {
            pre_test: {
                min: number
                q1: number
                median: number
                q3: number
                max: number
                count: number
            }
            post_test: {
                min: number
                q1: number
                median: number
                q3: number
                max: number
                count: number
            }
        }
    >
    course_stats: Record<
        string,
        {
            pre_test: {
                avg: number
                count: number
            }
            post_test: {
                avg: number
                count: number
            }
        }
    >
}

interface DashboardModalProps {
    isOpen: boolean
    onClose: () => void
}

interface BoxPlotData {
    min: number
    q1: number
    median: number
    q3: number
    max: number
    count: number
}

interface BoxPlotProps {
    data: {
        labels: string[]
        datasets: {
            label: string
            data: BoxPlotData[]
            backgroundColor: string
            borderColor: string
            borderWidth: number
        }[]
    }
    options: any
}

export default function DashboardModal({ isOpen, onClose }: DashboardModalProps) {
    const [progress, setProgress] = useState<ProgressReport | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"overview" | "details">("overview")

    useEffect(() => {
        if (!isOpen) return

        const fetchProgressReport = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    setError("User not authenticated")
                    return
                }

                const response = await getProgressReport()

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

    // Define chart colors with better contrast and visual appeal
    const chartColors = {
        planning: "rgba(56, 189, 248, 0.85)", // Sky blue
        monitoring: "rgba(250, 204, 21, 0.85)", // Yellow
        controlling: "rgba(168, 85, 247, 0.85)", // Purple
        review: "rgba(34, 197, 94, 0.85)", // Green
        preTest: "rgba(59, 130, 246, 0.7)", // Blue
        postTest: "rgba(16, 185, 129, 0.7)", // Teal
    }

    const chartBorderColors = {
        planning: "rgb(14, 165, 233)", // Sky blue
        monitoring: "rgb(234, 179, 8)", // Yellow
        controlling: "rgb(147, 51, 234)", // Purple
        review: "rgb(22, 163, 74)", // Green
        preTest: "rgb(37, 99, 235)", // Blue
        postTest: "rgb(13, 148, 136)", // Teal
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[95%] max-w-6xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg mr-3 text-white">
                            <BarChart2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics Dashboard</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Visualizing your learning progress</p>
                        </div>
                    </div>
                    <button
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button
                        className={`px-5 py-3 font-medium text-sm transition-colors relative ${activeTab === "overview"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                        {activeTab === "overview" && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                            />
                        )}
                    </button>
                    <button
                        className={`px-5 py-3 font-medium text-sm transition-colors relative ${activeTab === "details"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        onClick={() => setActiveTab("details")}
                    >
                        Detailed Analysis
                        {activeTab === "details" && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                            />
                        )}
                    </button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar" style={{ maxHeight: "calc(90vh - 140px)" }}>
                    {error ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-5 rounded-xl border border-red-100 dark:border-red-800/30"
                        >
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="font-semibold">Error Loading Dashboard</p>
                            </div>
                            <p>{error}</p>
                        </motion.div>
                    ) : !progress ? (
                        <div className="flex flex-col justify-center items-center h-64">
                            <div className="relative">
                                <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
                                <div
                                    className="w-16 h-16 border-r-4 border-l-4 border-transparent rounded-full animate-spin absolute top-0 left-0"
                                    style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                                ></div>
                            </div>
                            <p className="mt-4 text-slate-500 dark:text-slate-400">Loading your analytics data...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Progress Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 p-6 rounded-xl shadow-sm"
                            >
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                                    <Activity className="mr-2 h-5 w-5 text-blue-500" />
                                    Progress Summary
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <motion.div
                                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                        <Layers className="h-8 w-8 text-blue-500 mb-2" />
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Cards</p>
                                        <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-1">{progress.total_cards}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                        <CheckIcon className="h-8 w-8 text-green-500 mb-2" />
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
                                        <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-1">{progress.done_cards}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                        <Award className="h-8 w-8 text-indigo-500 mb-2" />
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completion Rate</p>
                                        <div className="flex items-end mt-1">
                                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {progress.progress_percentage.toFixed(1)}%
                                            </p>
                                            <div className="ml-3 mb-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-24">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${progress.progress_percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {activeTab === "overview" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Doughnut Chart */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                                                <PieChart className="mr-2 h-5 w-5 text-blue-500" />
                                                Task Status Distribution
                                            </h3>
                                            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                                <PieChart className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="h-72 flex items-center justify-center">
                                            <Doughnut
                                                data={{
                                                    labels: ["Planning", "Monitoring", "Controlling", "Review"],
                                                    datasets: [
                                                        {
                                                            data: [
                                                                progress.list_report["Planning (To Do)"] || 0,
                                                                progress.list_report["Monitoring (In Progress)"] || 0,
                                                                progress.list_report["Controlling (Review)"] || 0,
                                                                progress.list_report["Reflection (Done)"] || 0,
                                                            ],
                                                            backgroundColor: [
                                                                chartColors.planning,
                                                                chartColors.monitoring,
                                                                chartColors.controlling,
                                                                chartColors.review,
                                                            ],
                                                            borderWidth: 2,
                                                            borderColor: [
                                                                chartBorderColors.planning,
                                                                chartBorderColors.monitoring,
                                                                chartBorderColors.controlling,
                                                                chartBorderColors.review,
                                                            ],
                                                            hoverOffset: 15,
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: "bottom",
                                                            labels: {
                                                                padding: 20,
                                                                usePointStyle: true,
                                                                pointStyle: "circle",
                                                                color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                            },
                                                        },
                                                        tooltip: {
                                                            backgroundColor: document.documentElement.classList.contains("dark")
                                                                ? "rgba(30, 41, 59, 0.9)"
                                                                : "rgba(255, 255, 255, 0.9)",
                                                            titleColor: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                            bodyColor: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                            borderColor: document.documentElement.classList.contains("dark")
                                                                ? "rgba(100, 116, 139, 0.5)"
                                                                : "rgba(203, 213, 225, 0.5)",
                                                            borderWidth: 1,
                                                            padding: 12,
                                                            cornerRadius: 8,
                                                            callbacks: {
                                                                label: (context) => {
                                                                    const value = context.raw as number
                                                                    const total = context.dataset.data.reduce((a, b) => a + (b as number), 0)
                                                                    const percentage = ((value / total) * 100).toFixed(1)
                                                                    return `${context.label}: ${value} (${percentage}%)`
                                                                },
                                                            },
                                                        },
                                                    },
                                                    cutout: "65%",
                                                }}
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Bar Chart */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                                                <BarChart2 className="mr-2 h-5 w-5 text-blue-500" />
                                                Cards Per Column
                                            </h3>
                                            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                                <BarChart2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="h-72">
                                            <Bar
                                                data={{
                                                    labels: Object.keys(progress.list_report),
                                                    datasets: [
                                                        {
                                                            label: "Number of Cards",
                                                            data: Object.values(progress.list_report),
                                                            backgroundColor: Object.keys(progress.list_report).map((key) => {
                                                                if (key.includes("Planning")) return chartColors.planning
                                                                if (key.includes("Monitoring")) return chartColors.monitoring
                                                                if (key.includes("Controlling")) return chartColors.controlling
                                                                if (key.includes("Reflection")) return chartColors.review
                                                                return chartColors.planning
                                                            }),
                                                            borderColor: Object.keys(progress.list_report).map((key) => {
                                                                if (key.includes("Planning")) return chartBorderColors.planning
                                                                if (key.includes("Monitoring")) return chartBorderColors.monitoring
                                                                if (key.includes("Controlling")) return chartBorderColors.controlling
                                                                if (key.includes("Reflection")) return chartBorderColors.review
                                                                return chartBorderColors.planning
                                                            }),
                                                            borderWidth: 2,
                                                            borderRadius: 8,
                                                            hoverBackgroundColor: Object.keys(progress.list_report).map((key) => {
                                                                if (key.includes("Planning")) return "rgba(56, 189, 248, 1)"
                                                                if (key.includes("Monitoring")) return "rgba(250, 204, 21, 1)"
                                                                if (key.includes("Controlling")) return "rgba(168, 85, 247, 1)"
                                                                if (key.includes("Reflection")) return "rgba(34, 197, 94, 1)"
                                                                return "rgba(56, 189, 248, 1)"
                                                            }),
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
                                                        tooltip: {
                                                            backgroundColor: document.documentElement.classList.contains("dark")
                                                                ? "rgba(30, 41, 59, 0.9)"
                                                                : "rgba(255, 255, 255, 0.9)",
                                                            titleColor: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                            bodyColor: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                            borderColor: document.documentElement.classList.contains("dark")
                                                                ? "rgba(100, 116, 139, 0.5)"
                                                                : "rgba(203, 213, 225, 0.5)",
                                                            borderWidth: 1,
                                                            padding: 12,
                                                            cornerRadius: 8,
                                                        },
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            ticks: {
                                                                color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                font: {
                                                                    size: 11,
                                                                },
                                                                padding: 8,
                                                            },
                                                            grid: {
                                                                color: document.documentElement.classList.contains("dark")
                                                                    ? "rgba(255, 255, 255, 0.05)"
                                                                    : "rgba(0, 0, 0, 0.05)",
                                                                // drawBorder: false,
                                                            },
                                                            border: {
                                                                display: false,
                                                            },
                                                        },
                                                        x: {
                                                            ticks: {
                                                                color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                font: {
                                                                    size: 11,
                                                                },
                                                                padding: 8,
                                                                maxRotation: 45,
                                                                minRotation: 45,
                                                            },
                                                            grid: {
                                                                display: false,
                                                            },
                                                            border: {
                                                                display: false,
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Box Plot Chart
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                                                <Activity className="mr-2 h-5 w-5 text-blue-500" />
                                                Grade Distribution by Strategy
                                            </h3>
                                            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                                <Activity className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="h-72">
                                            {progress.strategy_stats && Object.keys(progress.strategy_stats).length > 0 ? (
                                                <Bar
                                                    data={{
                                                        labels: Object.keys(progress.strategy_stats),
                                                        datasets: [
                                                            {
                                                                label: "Pre-test Grades",
                                                                data: Object.values(progress.strategy_stats).map((stats) => ({
                                                                    min: stats.pre_test.min,
                                                                    q1: stats.pre_test.q1,
                                                                    median: stats.pre_test.median,
                                                                    q3: stats.pre_test.q3,
                                                                    max: stats.pre_test.max,
                                                                    count: stats.pre_test.count,
                                                                })),
                                                                backgroundColor: chartColors.preTest,
                                                                borderColor: chartBorderColors.preTest,
                                                                borderWidth: 2,
                                                                borderRadius: 4,
                                                            },
                                                            {
                                                                label: "Post-test Grades",
                                                                data: Object.values(progress.strategy_stats).map((stats) => ({
                                                                    min: stats.post_test.min,
                                                                    q1: stats.post_test.q1,
                                                                    median: stats.post_test.median,
                                                                    q3: stats.post_test.q3,
                                                                    max: stats.post_test.max,
                                                                    count: stats.post_test.count,
                                                                })),
                                                                backgroundColor: chartColors.postTest,
                                                                borderColor: chartBorderColors.postTest,
                                                                borderWidth: 2,
                                                                borderRadius: 4,
                                                            },
                                                        ],
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: {
                                                                position: "bottom",
                                                                labels: {
                                                                    padding: 20,
                                                                    usePointStyle: true,
                                                                    pointStyle: "circle",
                                                                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                },
                                                            },
                                                            tooltip: {
                                                                backgroundColor: document.documentElement.classList.contains("dark")
                                                                    ? "rgba(30, 41, 59, 0.9)"
                                                                    : "rgba(255, 255, 255, 0.9)",
                                                                titleColor: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                bodyColor: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                borderColor: document.documentElement.classList.contains("dark")
                                                                    ? "rgba(100, 116, 139, 0.5)"
                                                                    : "rgba(203, 213, 225, 0.5)",
                                                                borderWidth: 1,
                                                                padding: 12,
                                                                cornerRadius: 8,
                                                                callbacks: {
                                                                    label: (context: any) => {
                                                                        const value = context.dataset.data[context.dataIndex]
                                                                        return [
                                                                            `Min: ${value.min}`,
                                                                            `Q1: ${value.q1}`,
                                                                            `Median: ${value.median}`,
                                                                            `Q3: ${value.q3}`,
                                                                            `Max: ${value.max}`,
                                                                            `Count: ${value.count}`,
                                                                        ]
                                                                    },
                                                                },
                                                            },
                                                        },
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                max: 100,
                                                                title: {
                                                                    display: true,
                                                                    text: "Grade",
                                                                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                    font: {
                                                                        size: 12,
                                                                        weight: "normal",
                                                                    },
                                                                },
                                                                ticks: {
                                                                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                    font: {
                                                                        size: 11,
                                                                    },
                                                                    padding: 8,
                                                                },
                                                                grid: {
                                                                    color: document.documentElement.classList.contains("dark")
                                                                        ? "rgba(255, 255, 255, 0.05)"
                                                                        : "rgba(0, 0, 0, 0.05)",
                                                                    //   drawBorder: false,
                                                                },
                                                                border: {
                                                                    display: false,
                                                                },
                                                            },
                                                            x: {
                                                                title: {
                                                                    display: true,
                                                                    text: "Learning Strategy",
                                                                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                    font: {
                                                                        size: 12,
                                                                        weight: "normal",
                                                                    },
                                                                },
                                                                ticks: {
                                                                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                    font: {
                                                                        size: 11,
                                                                    },
                                                                    padding: 8,
                                                                },
                                                                grid: {
                                                                    display: false,
                                                                },
                                                                border: {
                                                                    display: false,
                                                                },
                                                            },
                                                        },
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full mb-3">
                                                        <Activity className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                                    </div>
                                                    <p className="text-slate-500 dark:text-slate-400 text-center">
                                                        No grade data available for learning strategies
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div> */}

                                    {/* Course Performance Chart */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 col-span-2"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                                                <Award className="mr-2 h-5 w-5 text-blue-500" />
                                                Course Performance
                                            </h3>
                                            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                                <BarChart2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="h-72">
                                            {progress.course_stats && Object.keys(progress.course_stats).length > 0 ? (
                                                <Bar
                                                    data={{
                                                        labels: Object.keys(progress.course_stats),
                                                        datasets: [
                                                            {
                                                                label: "Pre-test Average",
                                                                data: Object.values(progress.course_stats).map((stats) => stats.pre_test.avg),
                                                                backgroundColor: chartColors.preTest,
                                                                borderColor: chartBorderColors.preTest,
                                                                borderWidth: 2,
                                                                borderRadius: 6,
                                                                hoverBackgroundColor: "rgba(59, 130, 246, 0.9)",
                                                                barThickness: 13, // Adjust bar width
                                                            },
                                                            {
                                                                label: "Post-test Average",
                                                                data: Object.values(progress.course_stats).map((stats) => stats.post_test.avg),
                                                                backgroundColor: chartColors.postTest,
                                                                borderColor: chartBorderColors.postTest,
                                                                borderWidth: 2,
                                                                borderRadius: 6,
                                                                hoverBackgroundColor: "rgba(16, 185, 129, 0.9)",
                                                                barThickness: 13, // Adjust bar width
                                                            },
                                                        ],
                                                    }}
                                                    options={{
                                                        indexAxis: 'y', // This makes it horizontal
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: {
                                                                position: "bottom",
                                                                labels: {
                                                                    padding: 20,
                                                                    usePointStyle: true,
                                                                    pointStyle: "circle",
                                                                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                },
                                                            },
                                                            tooltip: {
                                                                backgroundColor: document.documentElement.classList.contains("dark")
                                                                    ? "rgba(30, 41, 59, 0.9)"
                                                                    : "rgba(255, 255, 255, 0.9)",
                                                                titleColor: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                bodyColor: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                borderColor: document.documentElement.classList.contains("dark")
                                                                    ? "rgba(100, 116, 139, 0.5)"
                                                                    : "rgba(203, 213, 225, 0.5)",
                                                                borderWidth: 1,
                                                                padding: 12,
                                                                cornerRadius: 8,
                                                                callbacks: {
                                                                    label: (context: any) => {
                                                                        const courseStats = Object.values(progress.course_stats)[context.dataIndex];
                                                                        const statType = context.dataset.label?.includes("Pre-test") ? "pre_test" : "post_test";
                                                                        return [
                                                                            `${context.dataset.label}: ${context.raw.toFixed(1)}`,
                                                                            `Number of grades: ${courseStats[statType].count}`,
                                                                        ];
                                                                    },
                                                                },
                                                            },
                                                        },
                                                        scales: {
                                                            x: {
                                                                beginAtZero: true,
                                                                max: 100,
                                                                title: {
                                                                    display: true,
                                                                    text: "Average Grade",
                                                                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                    font: { size: 12, weight: "normal" },
                                                                },
                                                                ticks: {
                                                                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                    font: { size: 11 },
                                                                    padding: 8,
                                                                },
                                                                grid: {
                                                                    color: document.documentElement.classList.contains("dark")
                                                                        ? "rgba(255, 255, 255, 0.05)"
                                                                        : "rgba(0, 0, 0, 0.05)",
                                                                },
                                                                border: { display: false },
                                                            },
                                                            y: {
                                                                title: {
                                                                    display: true,
                                                                    text: "Course",
                                                                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                    font: { size: 12, weight: "normal" },
                                                                },
                                                                ticks: {
                                                                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                    font: { size: 11 },
                                                                    padding: 8,
                                                                },
                                                                grid: { display: false },
                                                                border: { display: false },
                                                            },
                                                        },
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full mb-3">
                                                        <BarChart2 className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                                    </div>
                                                    <p className="text-slate-500 dark:text-slate-400 text-center">
                                                        No grade data available for courses
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>

                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

// CheckIcon component
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
