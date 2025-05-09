"use client"

import { motion } from "framer-motion"
import { Activity, Layers, Award } from "lucide-react"
import type { ProgressReport } from "./types"

interface ProgressSummaryProps {
    progress: ProgressReport
}

export default function ProgressSummary({ progress }: ProgressSummaryProps) {
    return (
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