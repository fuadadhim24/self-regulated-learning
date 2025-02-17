import { useState } from "react";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [input, setInput] = useState("");

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = () => {
        if (input.trim() === "") return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);

        setTimeout(() => {
            const botResponse = { sender: "bot", text: "This is a placeholder response." };
            setMessages((prev) => [...prev, botResponse]);
        }, 500);

        setInput("");
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-0 right-6 w-[320px] z-50 transition-transform duration-300">
            {/* Chat Bar (Always Visible, Smaller Size) */}
            <div
                className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center cursor-pointer rounded-t-lg shadow-lg text-base font-semibold"
                style={{ height: "50px" }} // Reduced height
                onClick={toggleChat}
            >
                <span>Chatbot</span>
                <span>{isOpen ? "▼" : "▲"}</span> {/* Arrow Indicator */}
            </div>

            {/* Chat Window (Slides Up & Down) */}
            <div
                className={`bg-white border rounded-t-lg shadow-lg w-full overflow-hidden transition-all duration-300 ${isOpen ? "h-80 opacity-100" : "h-0 opacity-0 pointer-events-none"
                    }`}
            >
                {/* Chat Messages */}
                <div className="flex-grow overflow-y-auto p-3 h-64">
                    {messages.length === 0 ? (
                        <p className="text-gray-400 text-center">Start chatting!</p>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-2 p-2 rounded ${msg.sender === "user"
                                        ? "bg-blue-100 text-right ml-8"
                                        : "bg-gray-200 text-left mr-8"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-3 border-t flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-grow border border-gray-300 rounded-l px-2 py-1 focus:outline-none"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
