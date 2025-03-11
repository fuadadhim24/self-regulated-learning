"use client"

import { Clock, Pause } from "lucide-react"

interface StartStopToggleProps {
    isToggleOn: boolean
    onToggle: () => void
}

export default function StartStopToggle({ isToggleOn, onToggle }: StartStopToggleProps) {
    return (
        <div className="flex items-center">
            <button
                onClick={onToggle}
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

            {isToggleOn && <div className="ml-3 text-sm text-gray-600">Timer running...</div>}
        </div>
    )
}

