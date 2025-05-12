"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart2, PieChart, LineChart, BookOpen } from "lucide-react"
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
import type { ProgressReport, ChartColors, ChartBorderColors, CoursePerformanceProps } from "./types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TooltipItem } from "chart.js"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

interface TaskDistributionProps {
    listReport: {
        [key: string]: number
    }
    topStrategies: {
        strategy: string
        count: number
        most_used_in: string
    }[]
    courseStats: CoursePerformanceProps["courseStats"]
}

export default function TaskDistribution({ listReport, topStrategies, courseStats }: TaskDistributionProps) {
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

    // Prepare data for doughnut chart
    const doughnutData = {
        labels: Object.keys(listReport),
        datasets: [
            {
                data: Object.values(listReport),
                backgroundColor: [
                    chartColors.planning,
                    chartColors.monitoring,
                    chartColors.controlling,
                    chartColors.review,
                ],
                borderColor: [
                    chartBorderColors.planning,
                    chartBorderColors.monitoring,
                    chartBorderColors.controlling,
                    chartBorderColors.review,
                ],
                borderWidth: 2,
            },
        ],
    }

    // Prepare data for bar chart
    const barData = {
        labels: topStrategies.map(s => s.strategy),
        datasets: [
            {
                label: "Times Used",
                data: topStrategies.map(s => s.count),
                backgroundColor: chartColors.planning,
                borderColor: chartBorderColors.planning,
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: "rgba(56, 189, 248, 1)",
            },
        ],
    }

    const barOptions = {
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
                callbacks: {
                    label: function (context: any) {
                        const strategy = topStrategies[context.dataIndex]
                        return [
                            `Times Used: ${strategy.count}`,
                            `Most used in: ${strategy.most_used_in}`
                        ]
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
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
        }
    }

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
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
            },
        },
    }

    // Course performance bar options
    const courseBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
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
                        const stats = Object.values(courseStats)[context.dataIndex]
                        const statType = context.dataset.label?.includes("Pre-Test") ? "pre_test" : "post_test"
                        const value = context.raw as number
                        return [
                            `${context.dataset.label}: ${value.toFixed(2)}`,
                            `Sample size: ${stats[statType].count}`
                        ]
                    }
                }
            }
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
                title: {
                    display: true,
                    text: "Score (%)",
                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                    font: {
                        size: 12,
                    },
                }
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
        }
    }

    // Calculate top 5 courses by card count
    const courseCounts = Object.entries(courseStats).map(([course, stats]) => ({
        course,
        count: stats.pre_test.count + stats.post_test.count
    }))
    courseCounts.sort((a, b) => b.count - a.count)
    const top5Courses = courseCounts.slice(0, 5)

    // Prepare data for top courses bar chart
    const topCoursesData = {
        labels: top5Courses.map(c => c.course),
        datasets: [
            {
                label: "Number of Cards",
                data: top5Courses.map(c => c.count),
                backgroundColor: chartColors.controlling,
                borderColor: chartBorderColors.controlling,
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: "rgba(168, 85, 247, 1)",
            },
        ],
    }

    const topCoursesOptions = {
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
                callbacks: {
                    label: (context: TooltipItem<"bar">) => {
                        const value = context.raw as number
                        return `Number of Cards: ${value}`
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
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
                title: {
                    display: true,
                    text: "Number of Cards",
                    color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#334155",
                    font: {
                        size: 12,
                    },
                }
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
        }
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle>Learning Analytics</CardTitle>
                <CardDescription>Track your learning progress and performance</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="tasks" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-2">
                        <TabsTrigger value="tasks" className="flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Tasks by Stage
                        </TabsTrigger>
                        <TabsTrigger value="strategies" className="flex items-center gap-2">
                            <BarChart2 className="h-4 w-4" />
                            Top Strategies
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="flex items-center gap-2">
                            <LineChart className="h-4 w-4" />
                            Course Performance
                        </TabsTrigger>
                        <TabsTrigger value="top-courses" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Top Courses
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="tasks" className="h-[250px]">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </TabsContent>
                    <TabsContent value="strategies" className="h-[250px]">
                        <Bar data={barData} options={barOptions} />
                    </TabsContent>
                    <TabsContent value="performance" className="h-[250px]">
                        <Bar
                            data={{
                                labels: Object.keys(courseStats),
                                datasets: [
                                    {
                                        label: "Pre-Test Average",
                                        data: Object.values(courseStats).map((stat) => stat.pre_test.avg),
                                        backgroundColor: chartColors.preTest,
                                        borderColor: chartBorderColors.preTest,
                                        borderWidth: 2,
                                        borderRadius: 8,
                                        hoverBackgroundColor: "rgba(59, 130, 246, 1)",
                                    },
                                    {
                                        label: "Post-Test Average",
                                        data: Object.values(courseStats).map((stat) => stat.post_test.avg),
                                        backgroundColor: chartColors.postTest,
                                        borderColor: chartBorderColors.postTest,
                                        borderWidth: 2,
                                        borderRadius: 8,
                                        hoverBackgroundColor: "rgba(16, 185, 129, 1)",
                                    },
                                ],
                            }}
                            options={courseBarOptions}
                        />
                    </TabsContent>
                    <TabsContent value="top-courses" className="h-[250px]">
                        <Bar data={topCoursesData} options={topCoursesOptions} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
} 