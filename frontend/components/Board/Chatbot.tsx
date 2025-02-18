import { useState, useEffect, useRef } from 'react';

export default function Chatbot() {
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState(300); // Default width
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [input, setInput] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = () => {
        setIsResizing(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isResizing && containerRef.current) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= 250 && newWidth <= 500) { // Min & Max Width
                setWidth(newWidth);
            }
        }
    };

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleSendMessage = () => {
        if (input.trim() === '') return;

        const userMessage = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);

        // Simulate bot response after a delay
        setTimeout(() => {
            const botResponse = { sender: 'bot', text: 'This is a placeholder response.' };
            setMessages((prev) => [...prev, botResponse]);
        }, 500);

        setInput(''); // Clear input
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div
            ref={containerRef}
            className="bg-gray-100 border-l border-gray-300 p-4 relative"
            style={{ width: `${width}px` }}
        >
            {/* Resizable Bar */}
            <div
                onMouseDown={handleMouseDown}
                className="w-2 bg-gray-400 cursor-ew-resize absolute left-0 top-0 bottom-0"
            />

            {/* Chat Header */}
            <h2 className="text-lg font-bold mb-2 text-center">Chatbot</h2>

            {/* Chat Window */}
            <div className="h-80 bg-white border rounded p-2 overflow-y-auto mb-2">
                {messages.length === 0 ? (
                    <p className="text-gray-400 text-center">Start chatting!</p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`mb-2 p-2 rounded ${msg.sender === 'user'
                                ? 'bg-blue-100 text-right ml-8'
                                : 'bg-gray-200 text-left mr-8'
                                }`}
                        >
                            {msg.text}
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="flex">
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
    );
}
