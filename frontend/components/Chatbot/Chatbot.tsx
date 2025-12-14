"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Send, X, MessageSquare, Bell, Sparkles, Brain } from "lucide-react";
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
    {
      sender: string;
      text: React.ReactNode;
      timestamp?: Date;
      type?: string;
      isTyping?: boolean;
    }[]
  >([]);
  const [input, setInput] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [deepContext, setDeepContext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
            `- *${task.title}* – ${task.course} (Priority: ${task.priority})`
          );
        });
        lines.push("");
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

  const typeMessage = (
    messageIndex: number,
    fullText: string,
    callback: () => void
  ) => {
    let currentIndex = 0;
    const typingSpeed = 20;

    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        const partialText = fullText.substring(0, currentIndex);

        setMessages((prev) => {
          if (messageIndex >= prev.length) {
            clearInterval(interval);
            callback();
            return prev;
          }

          const newMessages = [...prev];
          if (newMessages[messageIndex]) {
            newMessages[messageIndex] = {
              ...newMessages[messageIndex],
              text: formatMessageText(partialText),
              isTyping: currentIndex < fullText.length,
            };
          }
          return newMessages;
        });

        currentIndex++;
      } else {
        clearInterval(interval);
        callback();
      }
    }, typingSpeed);
  };

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

    if (messages.length === 0) {
      try {
        const user = await getCurrentUser();
        const fullName =
          [user.first_name, user.last_name].filter(Boolean).join(" ") ||
          "there";
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `Hello ${fullName}! How can I help you today? 😊`,
          },
        ]);
      } catch (error) {
        console.error("Error fetching user:", error);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Hello! How can I assist you today?" },
        ]);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    openChat: () => {
      setIsOpen(true);
      if (messages.length === 0) {
        openChatInternal();
      }
    },
  }));

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

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
      const timeoutId = setTimeout(() => controller.abort(), 120000);

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
            mode: "asking",
            deep: deepContext,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("Response status:", input, userId, userName, res.status);

        if (!res.ok) throw new Error("Failed to get response");

        const data = await res.json();
        console.log("Response data:", data);
        const rawText =
          data.output || data.reply || "I didn't understand that.";

        setMessages((prev) => {
          const newMessages = [
            ...prev,
            {
              sender: "bot",
              text: "",
              timestamp: new Date(),
              isTyping: true,
            },
          ];

          const messageIndex = newMessages.length - 1;
          typeMessage(messageIndex, rawText, () => {
            setIsLoading(false);
          });

          return newMessages;
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.error("Request timeout:", fetchError);
          const errorMessage =
            "Sorry, the request took too long. Please try again.";
          setMessages((prev) => {
            const newMessages = [
              ...prev,
              {
                sender: "bot",
                text: "",
                timestamp: new Date(),
                isTyping: true,
              },
            ];

            const messageIndex = newMessages.length - 1;
            typeMessage(messageIndex, errorMessage, () => {
              setIsLoading(false);
            });

            return newMessages;
          });
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage =
        "Sorry, I can't respond right now. Please check if the n8n server is running.";
      setMessages((prev) => {
        const newMessages = [
          ...prev,
          {
            sender: "bot",
            text: "",
            timestamp: new Date(),
            isTyping: true,
          },
        ];

        const messageIndex = newMessages.length - 1;
        typeMessage(messageIndex, errorMessage, () => {
          setIsLoading(false);
        });

        return newMessages;
      });
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

  useEffect(() => {
    if (forceOpen && !isOpen) {
      setIsOpen(true);
      setHasNewMessage(false);
      setUnreadCount(0);
      setNotificationVisible(false);

      if (messages.length === 0) {
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
                text: `Hello ${fullName}! How can I help you today? 😊`,
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
    }
  }, [forceOpen, isOpen, messages.length]);

  useEffect(() => {
    const handleChatbotMessage = (event: CustomEvent) => {
      const message = event.detail;
      console.log("Received chatbot message:", message);

      setMessages((prev) => {
        // Check if we already have a message with the same timestamp and type
        const isDuplicate = prev.some(
          (msg) =>
            msg.timestamp &&
            message.timestamp &&
            msg.type === message.type &&
            msg.sender === message.sender &&
            Math.abs(
              new Date(msg.timestamp).getTime() -
                new Date(message.timestamp).getTime()
            ) < 1000
        );

        if (isDuplicate) {
          console.log("Duplicate message detected, skipping:", message);
          return prev;
        }

        const newMessages = [
          ...prev,
          {
            sender: message.sender,
            text: "",
            timestamp: new Date(message.timestamp),
            type: message.type,
            isTyping: true,
          },
        ];

        const messageIndex = newMessages.length - 1;
        const messageText =
          typeof message.text === "string"
            ? message.text
            : JSON.stringify(message.text);

        setTimeout(() => {
          typeMessage(messageIndex, messageText, () => {});
        }, 100);

        return newMessages;
      });

      if (!isOpen) {
        setHasNewMessage(true);
        setUnreadCount((prev) => prev + 1);

        let notificationText = "Card movement detected";
        if (
          message.type === "card_movement" &&
          typeof message.text === "string"
        ) {
          if (message.text.length > 100) {
            notificationText = message.text.substring(0, 100) + "...";
          } else {
            notificationText = message.text;
          }
        }

        setNotificationMessage(notificationText);
        setNotificationVisible(true);

        setTimeout(() => {
          setNotificationVisible(false);
        }, 5000);
      }
    };

    window.addEventListener(
      "chatbot-message",
      handleChatbotMessage as EventListener
    );

    return () => {
      window.removeEventListener(
        "chatbot-message",
        handleChatbotMessage as EventListener
      );
    };
  }, [isOpen, formatMessageText]);

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
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
              View Message
            </button>
          </div>
        </div>
      )}

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
        {isOpen && (
          <div className="bg-blue-600 text-white px-4 py-3 flex flex-col">
            <div className="flex justify-between items-center">
              <span className="font-medium">Learning Assistant</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="hover:text-blue-100"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 text-xs">
              <div className="flex items-center">
                <Brain size={14} className="mr-1" />
                <span>Deep Analysis</span>
              </div>
              <div className="relative inline-block w-10 h-5">
                <input
                  type="checkbox"
                  className="sr-only"
                  id="deep-context-toggle"
                  checked={deepContext}
                  onChange={() => setDeepContext(!deepContext)}
                />
                <label
                  htmlFor="deep-context-toggle"
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 transition-colors duration-200 rounded-full ${
                    deepContext ? "bg-blue-400" : "bg-gray-400"
                  }`}
                >
                  <span
                    className={`absolute h-4 w-4 bg-white rounded-full transition-transform duration-200 ${
                      deepContext
                        ? "transform translate-x-5"
                        : "transform translate-x-0.5"
                    } top-0.5`}
                  ></span>
                </label>
              </div>
            </div>
          </div>
        )}

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
                      <span>Learning Tip</span>
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
            {isLoading && (
              <div className="flex items-center my-2">
                <div className="flex space-x-1 mr-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Typing... {deepContext && "(estimated 25-120 seconds)"}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {isOpen && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800">
            <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <Brain size={12} className="mr-1" />
              <span>
                Mode:{" "}
                {deepContext
                  ? "Deep Analysis (with past patterns)"
                  : "Fast (without history)"}
              </span>
            </div>
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
