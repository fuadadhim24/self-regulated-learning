"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import type { ProgressReport } from "./types"
import ProgressSummary from "./ProgressSummary"
import TaskDistribution from "./TaskDistribution"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { boardAPI } from "@/utils/apiClient"
import { useToast } from "@/hooks/use-toast"

interface DashboardModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DashboardModal({ isOpen, onClose }: DashboardModalProps) {
    const [progress, setProgress] = useState<ProgressReport | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await boardAPI.getProgressReport()
                console.log("Progress report data:", data)
                setProgress(data)
            } catch (err: any) {
                console.error("Error fetching progress report:", err)
                setError(err.message || "Failed to fetch progress report")
                toast({
                    title: "Error",
                    description: "Failed to load dashboard data. Please try again.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        if (isOpen) {
            fetchProgress()
        }
    }, [isOpen, toast])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Learning Progress Dashboard</DialogTitle>
                    <DialogDescription>
                        Track your learning progress and performance across different strategies and courses
                    </DialogDescription>
                </DialogHeader>

                {error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-[150px] w-full" />
                        <Skeleton className="h-[350px] w-full" />
                    </div>
                ) : progress ? (
                    <div className="space-y-6">
                        <ProgressSummary progress={progress} />
                        <TaskDistribution
                            listReport={progress.list_report}
                            topStrategies={progress.top_strategies}
                            courseStats={progress.course_stats}
                        />
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No progress data available</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
} 