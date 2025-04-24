"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, X, MessageSquare } from "lucide-react"

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([])
    const [input, setInput] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const toggleChat = () => {
        setIsOpen(!isOpen)
    }

    const handleSendMessage = () => {
        if (input.trim() === "") return

        const userMessage = { sender: "user", text: input }
        setMessages((prev) => [...prev, userMessage])

        setTimeout(() => {
            const botResponse = { sender: "bot", text: "This is a placeholder response." }
            setMessages((prev) => [...prev, botResponse])
        }, 500)

        setInput("")
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    return (
        <div className="fixed bottom-6 right-6 z-[1000]">
            {/* Chat button */}
            <button
                onClick={toggleChat}
                className={`absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 ${isOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
                    }`}
                aria-label="Open chat"
            >
                <MessageSquare size={24} />
            </button>

            {/* Chat window */}
            <div
                className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    }`}
                style={{
                    width: "320px",
                    maxHeight: "500px",
                    height: isOpen ? "auto" : "60px", // Adjust height when minimized
                    visibility: isOpen ? "visible" : "hidden", // Hide when minimized
                }}
            >
                {/* Chat Header */}
                {isOpen && (
                    <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
                        <span className="font-medium">Learning Assistant</span>
                        <button onClick={toggleChat} className="text-white hover:text-blue-100 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Chat Messages */}
                {isOpen && (
                    <div className="h-80 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 space-y-2">
                                <MessageSquare size={32} className="opacity-50" />
                                <p>How can I help with your learning today?</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`mb-3 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                                    <span
                                        className={`inline-block px-4 py-2 rounded-lg ${msg.sender === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
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

                {/* Input Area */}
                {isOpen && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-grow border border-slate-300 dark:border-slate-600 rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-r-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
