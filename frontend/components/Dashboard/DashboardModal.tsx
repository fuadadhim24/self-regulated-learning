"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { getProgressReport } from "@/utils/api"
import type { ProgressReport } from "./types"
import ProgressSummary from "./ProgressSummary"
import TaskDistribution from "./TaskDistribution"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DashboardModal({ isOpen, onClose }: DashboardModalProps) {
    const [progress, setProgress] = useState<ProgressReport | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true)
                const response = await getProgressReport()
                if (!response.ok) throw new Error("Failed to fetch progress report")
                const data = await response.json()
                setProgress(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (isOpen) {
            fetchProgress()
        }
    }, [isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                        <Skeleton className="h-[150px] w-full" />
                    </div>
                ) : progress ? (
                    <div className="space-y-4">
                        <ProgressSummary progress={progress} />
                        <TaskDistribution
                            listReport={progress.list_report}
                            topStrategies={progress.top_strategies}
                            courseStats={progress.course_stats}
                        />
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    )
} 