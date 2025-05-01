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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950">
            <Navbar />
            <main className="flex-grow px-4 md:px-6 lg:px-8 py-6">
                <div className="max-w-[1600px] mx-auto">
                    <Board />
                </div>
            </main>
            <footer className="py-4 px-6 text-center text-sm text-indigo-600 dark:text-indigo-400 border-t border-indigo-200 dark:border-indigo-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <p>© {new Date().getFullYear()} SRL Learning Board</p>
            </footer>
            <Chatbot />
        </div>
    )
}
