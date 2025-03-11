"use client"

import Board from "@/components/Board/Board"
import Navbar from "@/components/Navbar"
import Chatbot from "@/components/Chatbot/Chatbot"
import { useState, useEffect } from "react"

export default function BoardPage() {
    const [mounted, setMounted] = useState(false)

    // Handle hydration issues with client components
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <Navbar />
            <main className="flex-grow px-4 md:px-6 lg:px-8 py-6">
                <div className="max-w-[1600px] mx-auto">
                    <Board />
                </div>
            </main>
            <footer className="py-4 px-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                <p>© {new Date().getFullYear()} SRL Learning Board</p>
            </footer>
            <Chatbot />
        </div>
    )
}

