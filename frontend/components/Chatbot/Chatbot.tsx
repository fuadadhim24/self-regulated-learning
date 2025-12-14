"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Send, X, MessageSquare, Bell, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/utils/api";

interface ChatbotProps {
  forceOpen?: boolean;
}

export interface ChatbotRef {
  openChat: () => void;
}

export default forwardRef<ChatbotRef, ChatbotProps>(function Chatbot(
  { forceOpen = false },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: string; text: React.ReactNode; timestamp?: Date; type?: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  type Task = {
    status: string;
    course: string;
    title: string;
    priority: string;
  };

  function formatMessageText(textOrTasks: string | Task[]) {
    let text = "";

    if (Array.isArray(textOrTasks)) {
      const grouped: Record<string, Task[]> = {};

      textOrTasks.forEach((task) => {
        if (!grouped[task.status]) {
          grouped[task.status] = [];
        }
        grouped[task.status].push(task);
      });

      const sectionOrder = [
        "Planning (To Do)",
        "Monitoring (In Progress)",
        "Controlling (Review)",
        "Reflection (Done)",
      ];
      const lines: string[] = [];

      sectionOrder.forEach((status) => {
        const tasks = grouped[status];
        if (!tasks || tasks.length === 0) return;

        lines.push(`${status}:`);
        tasks.forEach((task) => {
          lines.push(
            `- *${task.title}* – ${task.course} (Prioritas: ${task.priority})`
          );
        });
        lines.push(""); // newline antar section
      });

      text = lines.join("\n");
    } else {
      text = textOrTasks;
    }

    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\n)/g);
    return parts.map((part, index) => {
      if (part === "\n") return <br key={index} />;
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return <span key={index}>{part}</span>;
    });
  }

  const toggleChat = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      openChatInternal();
    }
  };

  const openChatInternal = async () => {
    setHasNewMessage(false);
    setUnreadCount(0);
    setNotificationVisible(false);
    setMessages([]); // Clear messages when opening chat

    // Welcome message
    try {
      const user = await getCurrentUser();
      const fullName =
        [user.first_name, user.last_name].filter(Boolean).join(" ") || "there";
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Hello ${fullName}! Bagaimana saya dapat membantu anda hari ini? 😊`,
        },
      ]);
    } catch (error) {
      console.error("Error fetching user:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Hello! How can I assist you today?" },
      ]);
    }
  };

  // Expose openChat function to parent component
  useImperativeHandle(ref, () => ({
    openChat: () => {
      setIsOpen(true);
      openChatInternal();
    },
  }));

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const user = await getCurrentUser();
      const userId = user._id || user.username;
      const userName =
        [user.first_name, user.last_name].filter(Boolean).join(" ") ||
        user.username;
      console.log(input);

      const n8nWebhookUrl =
        process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
        "http://localhost:5678/webhook/d71e87c6-e1a3-4205-9dcc-81c8ce50f3bb";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const res = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input,
            userId,
            userName,
            type: "message",
            mode: "asking", // Use asking mode for direct user messages
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("Response status:", input, userId, userName, res.status);

        if (!res.ok) throw new Error("Failed to get response");

        const data = await res.json();
        console.log("Response data:", data); // Tambahkan log untuk debugging
        const rawText =
          data.output || data.reply || "I didn't understand that.";
        const formattedText = formatMessageText(rawText);

        const botMessage = {
          sender: "bot",
          text: formattedText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.error("Request timeout:", fetchError);
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Sorry, the request took too long. Please try again.",
            },
          ]);
        } else {
          throw fetchError; // Re-throw to be caught by the outer catch
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I can't respond right now. Please check if the n8n server is running.",
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle forceOpen prop
  useEffect(() => {
    if (forceOpen && !isOpen) {
      setIsOpen(true);
      // Initialize chat with welcome message
      setHasNewMessage(false);
      setUnreadCount(0);
      setNotificationVisible(false);
      setMessages([]); // Clear messages when opening chat

      // Welcome message
      const initializeChat = async () => {
        try {
          const user = await getCurrentUser();
          const fullName =
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            "there";
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `Hello ${fullName}! Bagaimana saya dapat membantu anda hari ini? 😊`,
            },
          ]);
        } catch (error) {
          console.error("Error fetching user:", error);
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Hello! How can I assist you today?" },
          ]);
        }
      };

      initializeChat();
    }
  }, [forceOpen, isOpen]);

  // Listen for chatbot messages from card movements
  useEffect(() => {
    const handleChatbotMessage = (event: CustomEvent) => {
      const message = event.detail;
      console.log("Received chatbot message:", message);

      // Add the message to the chat
      setMessages((prev) => [
        ...prev,
        {
          sender: message.sender,
          text: formatMessageText(message.text),
          timestamp: new Date(message.timestamp),
          type: message.type,
        },
      ]);

      // Show notification if chat is not open
      if (!isOpen) {
        setHasNewMessage(true);
        setUnreadCount((prev) => prev + 1);

        // Create a more informative notification message based on card movement
        let notificationText = "Card movement detected";
        if (
          message.type === "card_movement" &&
          typeof message.text === "string"
        ) {
          // Extract a brief summary for the notification
          if (message.text.length > 100) {
            notificationText = message.text.substring(0, 100) + "...";
          } else {
            notificationText = message.text;
          }
        }

        setNotificationMessage(notificationText);
        setNotificationVisible(true);

        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setNotificationVisible(false);
        }, 5000);
      }
    };

    // Check for stored messages in localStorage
    const storedMessages = JSON.parse(
      localStorage.getItem("chatbotMessages") || "[]"
    );
    if (storedMessages.length > 0) {
      storedMessages.forEach((message: any) => {
        setMessages((prev) => [
          ...prev,
          {
            sender: message.sender,
            text: formatMessageText(message.text),
            timestamp: new Date(message.timestamp),
            type: message.type,
          },
        ]);
      });

      // Clear stored messages
      localStorage.removeItem("chatbotMessages");
    }

    // Add event listener
    window.addEventListener(
      "chatbot-message",
      handleChatbotMessage as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "chatbot-message",
        handleChatbotMessage as EventListener
      );
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {/* Notifikasi Chatbot */}
      {notificationVisible && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg shadow-lg p-4 mb-2 w-72 animate-fadeIn">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Learning Assistant
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300 line-clamp-2">
                {notificationMessage}
              </p>
            </div>
            <button
              onClick={() => setNotificationVisible(false)}
              className="ml-2 flex-shrink-0 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 flex">
            <button
              onClick={() => {
                setNotificationVisible(false);
                setIsOpen(true);
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Lihat Pesan
            </button>
          </div>
        </div>
      )}

      {/* Tombol Chat */}
      <button
        onClick={toggleChat}
        className={`absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
          isOpen
            ? "opacity-0 scale-95 pointer-events-none"
            : "opacity-100 scale-100"
        }`}
        aria-label="Open chat"
      >
        {hasNewMessage ? (
          <div className="relative">
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        ) : (
          <MessageSquare size={24} />
        )}
      </button>

      {/* Jendela Chat */}
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl transition-all duration-300 overflow-hidden ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
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
                <div
                  key={idx}
                  className={`mb-3 ${
                    msg.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.sender === "bot" && msg.type === "card_movement" && (
                    <div className="text-xs text-blue-500 dark:text-blue-400 mb-1 flex items-center">
                      <Sparkles size={12} className="mr-1" />
                      <span>Tip Pembelajaran</span>
                    </div>
                  )}
                  <span
                    className={`inline-block px-4 py-2 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white"
                        : msg.type === "card_movement"
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {msg.text}
                  </span>
                  {msg.timestamp && (
                    <div
                      className={`text-xs mt-1 text-slate-500 dark:text-slate-400 ${
                        msg.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
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
  );
});
