"use client"

import { useEffect, useState } from "react"
import { getProgressReport } from "@/utils/api"
import { Pie, Bar, Doughnut } from "react-chartjs-2"
import { X } from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
)

interface ProgressReport {
    total_cards: number
    done_cards: number
    progress_percentage: number
    list_report: Record<string, number>
    strategy_stats: Record<string, {
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
    }>
    course_stats: Record<string, {
        pre_test: {
            avg: number
            count: number
        }
        post_test: {
            avg: number
            count: number
        }
    }>
}

interface DashboardModalProps {
    isOpen: boolean
    onClose: () => void
}

interface BoxPlotData {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    count: number;
}

interface BoxPlotProps {
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: BoxPlotData[];
            backgroundColor: string;
            borderColor: string;
            borderWidth: number;
        }[];
    };
    options: any;
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
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto"
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
                                {/* Doughnut Chart */}
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Task Status Distribution</h3>
                                    <div className="h-64 flex items-center justify-center">
                                        <Doughnut
                                            data={{
                                                labels: ["Planning", "Monitoring", "Controlling", "Review"],
                                                datasets: [
                                                    {
                                                        data: [
                                                            progress.list_report["Planning (To Do)"] || 0,
                                                            progress.list_report["Monitoring (In Progress)"] || 0,
                                                            progress.list_report["Controlling (Review)"] || 0,
                                                            progress.list_report["Reflection (Done)"] || 0
                                                        ],
                                                        backgroundColor: [
                                                            "#3b82f6", // Blue for Planning
                                                            "#f59e0b", // Amber for Monitoring
                                                            "#8b5cf6", // Purple for Controlling
                                                            "#10b981"  // Green for Review
                                                        ],
                                                        borderWidth: 1,
                                                        borderColor: [
                                                            "#3b82f6",
                                                            "#f59e0b",
                                                            "#8b5cf6",
                                                            "#10b981"
                                                        ],
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
                                                            color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                        },
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => {
                                                                const value = context.raw as number;
                                                                const total = context.dataset.data.reduce((a, b) => a + (b as number), 0);
                                                                const percentage = ((value / total) * 100).toFixed(1);
                                                                return `${context.label}: ${value} (${percentage}%)`;
                                                            }
                                                        }
                                                    }
                                                },
                                                cutout: "60%"
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

                                {/* Box Plot Chart */}
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Grade Distribution by Learning Strategy</h3>
                                    <div className="h-64">
                                        {progress.strategy_stats && Object.keys(progress.strategy_stats).length > 0 ? (
                                            <Bar
                                                data={{
                                                    labels: Object.keys(progress.strategy_stats),
                                                    datasets: [
                                                        {
                                                            label: "Pre-test Grades",
                                                            data: Object.values(progress.strategy_stats).map(stats => ({
                                                                min: stats.pre_test.min,
                                                                q1: stats.pre_test.q1,
                                                                median: stats.pre_test.median,
                                                                q3: stats.pre_test.q3,
                                                                max: stats.pre_test.max,
                                                                count: stats.pre_test.count
                                                            })),
                                                            backgroundColor: "rgba(59, 130, 246, 0.5)",
                                                            borderColor: "#3b82f6",
                                                            borderWidth: 1
                                                        },
                                                        {
                                                            label: "Post-test Grades",
                                                            data: Object.values(progress.strategy_stats).map(stats => ({
                                                                min: stats.post_test.min,
                                                                q1: stats.post_test.q1,
                                                                median: stats.post_test.median,
                                                                q3: stats.post_test.q3,
                                                                max: stats.post_test.max,
                                                                count: stats.post_test.count
                                                            })),
                                                            backgroundColor: "rgba(16, 185, 129, 0.5)",
                                                            borderColor: "#10b981",
                                                            borderWidth: 1
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            display: true,
                                                            position: "bottom"
                                                        },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (context: any) => {
                                                                    const value = context.dataset.data[context.dataIndex];
                                                                    return [
                                                                        `Min: ${value.min}`,
                                                                        `Q1: ${value.q1}`,
                                                                        `Median: ${value.median}`,
                                                                        `Q3: ${value.q3}`,
                                                                        `Max: ${value.max}`,
                                                                        `Count: ${value.count}`
                                                                    ];
                                                                }
                                                            }
                                                        }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            max: 100,
                                                            title: {
                                                                display: true,
                                                                text: "Grade"
                                                            }
                                                        },
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: "Learning Strategy"
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                No grade data available for learning strategies
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Course Performance Chart */}
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Course Performance</h3>
                                    <div className="h-64">
                                        {progress.course_stats && Object.keys(progress.course_stats).length > 0 ? (
                                            <Bar
                                                data={{
                                                    labels: Object.keys(progress.course_stats),
                                                    datasets: [
                                                        {
                                                            label: "Pre-test Average",
                                                            data: Object.values(progress.course_stats).map(stats => stats.pre_test.avg),
                                                            backgroundColor: "rgba(59, 130, 246, 0.5)",
                                                            borderColor: "#3b82f6",
                                                            borderWidth: 1
                                                        },
                                                        {
                                                            label: "Post-test Average",
                                                            data: Object.values(progress.course_stats).map(stats => stats.post_test.avg),
                                                            backgroundColor: "rgba(16, 185, 129, 0.5)",
                                                            borderColor: "#10b981",
                                                            borderWidth: 1
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            display: true,
                                                            position: "bottom",
                                                            labels: {
                                                                color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                            }
                                                        },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (context: any) => {
                                                                    const courseStats = Object.values(progress.course_stats)[context.dataIndex];
                                                                    const statType = context.dataset.label?.includes("Pre-test") ? "pre_test" : "post_test";
                                                                    return [
                                                                        `${context.dataset.label}: ${context.raw}`,
                                                                        `Number of grades: ${courseStats[statType].count}`
                                                                    ];
                                                                }
                                                            }
                                                        }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            max: 100,
                                                            title: {
                                                                display: true,
                                                                text: "Average Grade"
                                                            },
                                                            ticks: {
                                                                color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                            },
                                                            grid: {
                                                                color: document.documentElement.classList.contains("dark")
                                                                    ? "rgba(255, 255, 255, 0.1)"
                                                                    : "rgba(0, 0, 0, 0.1)",
                                                            }
                                                        },
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: "Course"
                                                            },
                                                            ticks: {
                                                                color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                                                                maxRotation: 45,
                                                                minRotation: 45
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                No grade data available for courses
                                            </div>
                                        )}
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

