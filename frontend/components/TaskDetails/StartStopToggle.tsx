"use client"

import { Clock, Pause } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface StartStopToggleProps {
    cardId: string
    listName: string
    onToggleStateChange?: (isActive: boolean) => void
}

export default function StartStopToggle({ cardId, listName, onToggleStateChange }: StartStopToggleProps) {
    const { toast } = useToast();
    const [isToggleOn, setIsToggleOn] = useState(false)
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
    const [totalStudyTime, setTotalStudyTime] = useState<number>(0)
    const [elapsedTime, setElapsedTime] = useState<number>(0)
    const [startTime, setStartTime] = useState<Date | null>(null)
    const isDisabled = listName === "Reflection (Done)"

    // Notify parent component when toggle state changes
    useEffect(() => {
        onToggleStateChange?.(isToggleOn)
    }, [isToggleOn, onToggleStateChange])

    // Check if there's an active session when component mounts
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return

        const checkActiveSession = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/study-sessions/active/${cardId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (!response.ok) {
                    toast({ title: "Error", description: "Failed to fetch study sessions", variant: "destructive" })
                    return
                }
                const data = await response.json()
                setIsToggleOn(data.is_active)
                if (data.is_active) {
                    setStartTime(data.start_time)
                }
            } catch (error: any) {
                toast({ title: "Error", description: `Error checking active session: ${error.message}`, variant: "destructive" })
            }
        }
        if (token) {
            checkActiveSession()
        }
    }, [cardId])

    // Timer effect
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null

        if (isToggleOn && startTime) {
            intervalId = setInterval(() => {
                const now = new Date()
                const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60) // in minutes
                setElapsedTime(elapsed)
            }, 60000) // Update every minute
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, [isToggleOn, startTime])

    const fetchStudySessions = async () => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/study-sessions/card/${cardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                toast({ title: "Error", description: "Failed to fetch study sessions", variant: "destructive" })
                return
            }

            const data = await response.json()
            setTotalStudyTime(data.total_study_time_minutes || 0)
        } catch (error: any) {
            toast({ title: "Error", description: `Error fetching study sessions: ${error.message}`, variant: "destructive" })
        }
    }

    const handleStartSession = async () => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/study-sessions/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ card_id: cardId }),
            })

            if (!response.ok) {
                toast({ title: "Error", description: "Failed to start study session", variant: "destructive" })
                return
            }

            const data = await response.json()
            setCurrentSessionId(data._id)
            setStartTime(new Date())
            setIsToggleOn(true)
            toast({ title: "Success", description: "Study session started!", variant: "default" })
        } catch (error: any) {
            toast({ title: "Error", description: `Error starting session: ${error.message}`, variant: "destructive" })
        }
    }

    const handleStopSession = async () => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return

            if (currentSessionId) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/study-sessions/end`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ session_id: currentSessionId }),
                })

                if (!response.ok) {
                    toast({ title: "Error", description: "Failed to end study session", variant: "destructive" })
                    return
                }

                setCurrentSessionId(null)
                setStartTime(null)
                setIsToggleOn(false)
                setElapsedTime(0)
                fetchStudySessions() // Refresh total study time
                toast({ title: "Success", description: "Study session ended!", variant: "default" })
            }
        } catch (error: any) {
            toast({ title: "Error", description: `Error ending session: ${error.message}`, variant: "destructive" })
        }
    }

    const handleToggle = async () => {
        try {
            if (isToggleOn) {
                await handleStopSession()
            } else {
                await handleStartSession()
            }
        } catch (error: any) {
            toast({ title: "Error", description: `Error handling study session: ${error.message}`, variant: "destructive" })
        }
    }

    const formatTime = (minutes: number) => {
        const totalSeconds = minutes * 60
        const days = Math.floor(totalSeconds / (24 * 3600))
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
        const remainingMinutes = Math.floor((totalSeconds % 3600) / 60)

        if (days > 0) {
            return `${days}d ${hours}h ${remainingMinutes}m`
        } else if (hours > 0) {
            return `${hours}h ${remainingMinutes}m`
        } else {
            return `${remainingMinutes}m`
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="relative group">
                <button
                    onClick={handleToggle}
                    disabled={isDisabled}
                    className={`relative flex items-center px-4 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${isDisabled
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : isToggleOn
                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border border-red-400"
                            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border border-green-400"
                        }`}
                >
                    {isToggleOn ? (
                        <>
                            <Pause className="h-4 w-4 mr-2" />
                            <span className="font-medium">Stop Timer</span>
                        </>
                    ) : (
                        <>
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="font-medium">Start Timer</span>
                        </>
                    )}
                </button>

                {isDisabled && (
                    <div className="absolute -top-8 left-0 w-max max-w-xs px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Not editable in Reflection (Done) stage
                    </div>
                )}
            </div>

            <div className="flex flex-col text-sm text-indigo-600 dark:text-indigo-400">
                {isToggleOn && <div>Current session: {formatTime(elapsedTime)}</div>}
                {totalStudyTime > 0 && <div>Total study time: {formatTime(totalStudyTime)}</div>}
            </div>
        </div>
    )
}
