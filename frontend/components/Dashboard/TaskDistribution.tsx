"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart2, PieChart } from "lucide-react"
import { Bar, Doughnut } from "react-chartjs-2"
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from "chart.js"
import type { ProgressReport, ChartColors, ChartBorderColors } from "./types"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

interface TaskDistributionProps {
    progress: ProgressReport
}

export default function TaskDistribution({ progress }: TaskDistributionProps) {
    // Define chart colors with better contrast and visual appeal
    const chartColors: ChartColors = {
        planning: "rgba(56, 189, 248, 0.85)", // Sky blue
        monitoring: "rgba(250, 204, 21, 0.85)", // Yellow
        controlling: "rgba(168, 85, 247, 0.85)", // Purple
        review: "rgba(34, 197, 94, 0.85)", // Green
        preTest: "rgba(59, 130, 246, 0.7)", // Blue
        postTest: "rgba(16, 185, 129, 0.7)", // Teal
    }

    const chartBorderColors: ChartBorderColors = {
        planning: "rgb(14, 165, 233)", // Sky blue
        monitoring: "rgb(234, 179, 8)", // Yellow
        controlling: "rgb(147, 51, 234)", // Purple
        review: "rgb(22, 163, 74)", // Green
        preTest: "rgb(37, 99, 235)", // Blue
        postTest: "rgb(13, 148, 136)", // Teal
    }

    // Cleanup charts on unmount
    useEffect(() => {
        return () => {
            // Destroy all charts when component unmounts
            Object.values(ChartJS.instances).forEach(chart => {
                chart.destroy()
            })
        }
    }, [])

    return (
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
    )
} 