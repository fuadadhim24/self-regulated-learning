"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, X } from "lucide-react"

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
    }, [messages]) //Corrected dependency

    return (
        <div className="fixed bottom-0 right-6 w-80 z-50">
            <div
                className={`bg-white rounded-t-lg shadow-lg transition-all duration-300 ease-in-out ${isOpen ? "h-96" : "h-12"
                    }`}
            >
                {/* Chat Header */}
                <div
                    className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center cursor-pointer rounded-t-lg"
                    onClick={toggleChat}
                >
                    <span className="font-semibold">Chatbot</span>
                    {isOpen ? <X size={20} /> : <span className="text-xl">▲</span>}
                </div>

                {/* Chat Messages */}
                <div
                    className={`overflow-y-auto p-4 transition-all duration-300 ease-in-out ${isOpen ? "h-72 opacity-100" : "h-0 opacity-0"
                        }`}
                >
                    {messages.length === 0 ? (
                        <p className="text-gray-500 text-center">Start chatting!</p>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`mb-3 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                                <span
                                    className={`inline-block px-4 py-2 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                                        }`}
                                >
                                    {msg.text}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`border-t p-3 transition-all duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"}`}>
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-grow border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type a message..."
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-blue-500 text-white rounded-r-full px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

