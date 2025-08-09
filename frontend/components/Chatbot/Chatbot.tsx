"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, MessageSquare } from "lucide-react"
import { getCurrentUser } from "@/utils/api"

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ sender: string; text: React.ReactNode }[]>([])
    const [input, setInput] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

   type Task = {
        status: string
        course: string
        title: string
        priority: string
    }

    function formatMessageText(textOrTasks: string | Task[]) {
        let text = ""

        if (Array.isArray(textOrTasks)) {
            const grouped: Record<string, Task[]> = {}

            textOrTasks.forEach((task) => {
                if (!grouped[task.status]) {
                    grouped[task.status] = []
                }
                grouped[task.status].push(task)
            })

            const sectionOrder = [
                "Planning (To Do)",
                "Monitoring (In Progress)",
                "Controlling (Review)",
                "Reflection (Done)",
            ]
            const lines: string[] = []

            sectionOrder.forEach((status) => {
                const tasks = grouped[status]
                if (!tasks || tasks.length === 0) return

                lines.push(`${status}:`)
                tasks.forEach((task) => {
                    lines.push(`- *${task.title}* – ${task.course} (Prioritas: ${task.priority})`)
                })
                lines.push("") // newline antar section
            })

            text = lines.join("\n")
        } else {
            text = textOrTasks
        }

        const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\n)/g)
        return parts.map((part, index) => {
            if (part === "\n") return <br key={index} />
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={index}>{part.slice(2, -2)}</strong>
            }
            if (part.startsWith("*") && part.endsWith("*")) {
                return <em key={index}>{part.slice(1, -1)}</em>
            }
            return <span key={index}>{part}</span>
        })
    }


    const toggleChat = async () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            try {
                const user = await getCurrentUser()
                const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "there"
                setMessages((prev) => [
                    ...prev,
                    { sender: "bot", text: `Hello ${fullName}! Bagaimana saya dapat membantu anda hari ini? 😊` },
                ])
            } catch (error) {
                console.error("Error fetching user:", error)
                setMessages((prev) => [
                    ...prev,
                    { sender: "bot", text: "Hello! How can I assist you today?" },
                ])
            }
        }
    }

    const handleSendMessage = async () => {
        if (!input.trim()) return

        const userMessage = { sender: "user", text: input }
        setMessages((prev) => [...prev, userMessage])
        setInput("")

        try {
             const user = await getCurrentUser()
            const userId = user._id || user.username
            const userName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
            console.log(input)


            const res = await fetch("http://localhost:5000/api/chatbot/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input, userId, userName }),
            })
            console.log("Response status:", input, userId, userName, res.status)

            if (!res.ok) throw new Error("Failed to get response")

            const data = await res.json()
            const rawText = data.reply || "I didn't understand that."
            const formattedText = formatMessageText(rawText)

            const botMessage = { sender: "bot", text: formattedText }
            setMessages((prev) => [...prev, botMessage])
        } catch (error) {
            console.error("Chat error:", error)
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Sorry, I can't respond right now." },
            ])
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSendMessage()
    }

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    return (
        <div className="fixed bottom-6 right-6 z-[1000]">
            {/* Tombol Chat */}
            <button
                onClick={toggleChat}
                className={`absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
                    isOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
                }`}
                aria-label="Open chat"
            >
                <MessageSquare size={24} />
            </button>

            {/* Jendela Chat */}
            <div
                className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl transition-all duration-300 overflow-hidden ${
                    isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                }`}
                style={{
                    width: "320px",
                    maxHeight: "500px",
                    height: isOpen ? "auto" : "60px",
                    visibility: isOpen ? "visible" : "hidden",
                }}
            >
                {/* Header */}
                {isOpen && (
                    <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
                        <span className="font-medium">Learning Assistant</span>
                        <button onClick={toggleChat} className="hover:text-blue-100">
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Pesan */}
                {isOpen && (
                    <div className="h-80 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <MessageSquare size={32} className="opacity-50" />
                                <p>How can I help with your learning today?</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`mb-3 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                                    <span
                                        className={`inline-block px-4 py-2 rounded-lg ${
                                            msg.sender === "user"
                                                ? "bg-blue-500 text-white"
                                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                        }`}
                                    >
                                        {msg.text}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input */}
                {isOpen && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800">
                        <div className="flex">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-grow px-4 py-2 rounded-l-full border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-full"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}