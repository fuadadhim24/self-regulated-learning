"use client"

import { motion } from "framer-motion"
import { BarChart2 } from "lucide-react"
import { Bar } from "react-chartjs-2"
import type { ProgressReport, ChartColors, ChartBorderColors } from "./types"
import type { TooltipItem } from "chart.js"

interface CoursePerformanceProps {
    progress: ProgressReport
}

export default function CoursePerformance({ progress }: CoursePerformanceProps) {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-blue-500" />
                    Course Performance
                </h3>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <BarChart2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
            </div>
            <div className="h-72">
                <Bar
                    data={{
                        labels: Object.keys(progress.course_stats),
                        datasets: [
                            {
                                label: "Pre-Test Average",
                                data: Object.values(progress.course_stats).map((stat) => stat.pre_test.avg),
                                backgroundColor: chartColors.preTest,
                                borderColor: chartBorderColors.preTest,
                                borderWidth: 2,
                                borderRadius: 8,
                                hoverBackgroundColor: "rgba(59, 130, 246, 1)",
                            },
                            {
                                label: "Post-Test Average",
                                data: Object.values(progress.course_stats).map((stat) => stat.post_test.avg),
                                backgroundColor: chartColors.postTest,
                                borderColor: chartBorderColors.postTest,
                                borderWidth: 2,
                                borderRadius: 8,
                                hoverBackgroundColor: "rgba(16, 185, 129, 1)",
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
                                    label: (context: TooltipItem<"bar">) => {
                                        const courseStats = Object.values(progress.course_stats)[context.dataIndex]
                                        const statType = context.dataset.label?.includes("Pre-Test") ? "pre_test" : "post_test"
                                        const value = context.raw as number
                                        return [
                                            `${context.dataset.label}: ${value.toFixed(1)}`,
                                            `Number of grades: ${courseStats[statType].count}`,
                                        ]
                                    },
                                },
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
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
    )
} 