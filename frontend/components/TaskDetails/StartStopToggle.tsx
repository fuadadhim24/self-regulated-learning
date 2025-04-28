"use client"

import { Clock, Pause } from "lucide-react"
import { useState, useEffect } from "react"

interface StartStopToggleProps {
    cardId: string
}

export default function StartStopToggle({ cardId }: StartStopToggleProps) {
    const [isToggleOn, setIsToggleOn] = useState(false)
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
    const [totalStudyTime, setTotalStudyTime] = useState<number>(0)
    const [elapsedTime, setElapsedTime] = useState<number>(0)
    const [startTime, setStartTime] = useState<Date | null>(null)

    // Check if there's an active session when component mounts
    useEffect(() => {
        checkActiveSession()
        fetchStudySessions()
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

    const checkActiveSession = async () => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/study-sessions/card/${cardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                console.error("Failed to fetch study sessions")
                return
            }

            const data = await response.json()

            // Check if there's an active session (one without end_time)
            const activeSession = data.sessions.find((session: any) => !session.end_time)

            if (activeSession) {
                setIsToggleOn(true)
                setCurrentSessionId(activeSession._id)
                setStartTime(new Date(activeSession.start_time))

                // Calculate elapsed time
                const now = new Date()
                const start = new Date(activeSession.start_time)
                const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60)
                setElapsedTime(elapsed)
            }
        } catch (error) {
            console.error("Error checking active session:", error)
        }
    }

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
                console.error("Failed to fetch study sessions")
                return
            }

            const data = await response.json()
            setTotalStudyTime(data.total_study_time_minutes)
        } catch (error) {
            console.error("Error fetching study sessions:", error)
        }
    }

    const handleToggle = async () => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return

            if (!isToggleOn) {
                // Start new session
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/study-sessions/start`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ card_id: cardId }),
                })

                if (!response.ok) {
                    console.error("Failed to start study session")
                    return
                }

                const data = await response.json()
                setCurrentSessionId(data._id)
                setStartTime(new Date())
                setIsToggleOn(true)
            } else {
                // End current session
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
                        console.error("Failed to end study session")
                        return
                    }

                    setCurrentSessionId(null)
                    setStartTime(null)
                    setIsToggleOn(false)
                    setElapsedTime(0)
                    fetchStudySessions() // Refresh total study time
                }
            }
        } catch (error) {
            console.error("Error handling study session:", error)
        }
    }

    const formatTime = (minutes: number) => {
        const formattedMinutes = minutes.toFixed(2) // Format to 2 decimal places
        return `${formattedMinutes} minutes`
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleToggle}
                className={`relative flex items-center px-4 py-2 rounded-md transition-colors ${isToggleOn
                        ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
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

            <div className="flex flex-col text-sm text-gray-600">
                {isToggleOn && <div>Current session: {formatTime(elapsedTime)}</div>}
                {totalStudyTime > 0 && <div>Total study time: {formatTime(totalStudyTime)}</div>}
            </div>
        </div>
    )
}
