"use client"

import { useState } from "react"
import DashboardModal from "@/components/Board/DashboardModal"
import { BarChart3, Archive } from "lucide-react"

interface BoardHeaderProps {
    boardName: string
    onShowArchived: () => void
}

export default function BoardHeader({ boardName, onShowArchived }: BoardHeaderProps) {
    const [isDashboardOpen, setIsDashboardOpen] = useState(false)

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
                {boardName || "Loading Board..."}
            </h1>
            <div className="flex gap-3">
                <button
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                    onClick={() => setIsDashboardOpen(true)}
                >
                    <BarChart3 size={18} />
                    <span className="hidden sm:inline">Analytics</span>
                </button>
                <button
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                    onClick={onShowArchived}
                >
                    <Archive size={18} />
                    <span className="hidden sm:inline">Archived</span>
                </button>
            </div>

            <DashboardModal isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
        </div>
    )
}
