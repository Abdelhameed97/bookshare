import React, { useState, useRef, useEffect } from "react"
import { MessageSquare, Moon, Sun } from "lucide-react"
import "./FloatingChatButton.css"

const FloatingChatButton = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "مرحبًا بك في BookShare الذكاء الاصطناعي! هل يمكنني مساعدتك اليوم؟",
            isUser: false,
        },
    ])
    const [inputValue, setInputValue] = useState("")
    const [darkMode, setDarkMode] = useState(false)
    const messagesEndRef = useRef(null)
    const chatInputRef = useRef(null)

    const getCSRFToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]')
        return metaTag ? metaTag.content : null
    }

    const toggleChat = () => {
        setIsOpen(prev => !prev)
    }

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev)
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen && chatInputRef.current) {
            chatInputRef.current.focus()
        }
        scrollToBottom()
    }, [isOpen, messages])

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        const userMessage = {
            id: Date.now(),
            text: inputValue,
            isUser: true,
        }
        setMessages(prev => [...prev, userMessage])
        setInputValue("")

        try {
            const csrfToken = getCSRFToken()
            const headers = {
                "Content-Type": "application/json",
            }

            if (csrfToken) {
                headers["X-CSRF-TOKEN"] = csrfToken
            }

            const response = await fetch("http://127.0.0.1:8000/api/query", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ query: inputValue }),
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const data = await response.json()

            const botMessage = {
                id: Date.now() + 1,
                text:
                    data.message ||
                    "عذرًا، لم أفهم سؤالك. يمكنك طرح أسئلة عن الكتب أو التصنيفات.",
                isUser: false,
                books: data.results || null,
            }

            setMessages(prev => [...prev, botMessage])
        } catch (error) {
            console.error("Error:", error)
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: "حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
                    isUser: false,
                },
            ])
        }
    }

    const handleKeyPress = e => {
        if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    return (
        <div className="chat-container">
            <button
                className={`floating-chat-button ${isOpen ? "active" : ""}`}
                onClick={toggleChat}
                aria-label={isOpen ? "إغلاق الدردشة" : "فتح الدردشة"}
            >
                <MessageSquare size={20} />
                {!isOpen && <span className="notification-badge"></span>}
            </button>

            {isOpen && (
                <div className={`chat-window ${darkMode ? "dark-mode" : ""}`}>
                    <div className="chat-header">
                        <h3>BookShare</h3>
                        <div className="chat-actions">
                            <button
                                className="theme-toggle"
                                onClick={toggleDarkMode}
                                aria-label={
                                    darkMode
                                        ? "التبديل إلى الوضع النهاري"
                                        : "التبديل إلى الوضع الليلي"
                                }
                            >
                                {darkMode ? (
                                    <Sun size={16} />
                                ) : (
                                    <Moon size={16} />
                                )}
                            </button>
                            <button
                                className="close-button"
                                onClick={toggleChat}
                                aria-label="إغلاق الدردشة"
                            >
                                &times;
                            </button>
                        </div>
                    </div>

                    <div className="chat-body">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`message ${
                                    msg.isUser
                                        ? "user-message"
                                        : "assistant-message"
                                }`}
                            >
                                {msg.text}
                                {msg.books && msg.books.length > 0 && (
                                    <div className="book-suggestions">
                                        <p>إليك بعض الكتب المقترحة:</p>
                                        <div className="books-list">
                                            {msg.books.map(book => (
                                                <a
                                                    key={book.id}
                                                    href={`/books/${book.id}`}
                                                    className="book-link"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <div className="book-info">
                                                        <strong>
                                                            {book.title}
                                                        </strong>
                                                        <span>
                                                            بواسطة {book.author}
                                                        </span>
                                                    </div>
                                                    <div className="book-price">
                                                        {book.price} ج.م
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                        <p className="follow-up">
                                            هل يمكنني مساعدتك في شيء آخر؟
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input">
                        <input
                            type="text"
                            id="chat-input-field"
                            name="chat_message"
                            ref={chatInputRef}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="اكتب سؤالك هنا..."
                            autoComplete="off"
                        />
                        <button
                            onClick={handleSendMessage}
                            aria-label="إرسال الرسالة"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path d="M22 2L11 13"></path>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FloatingChatButton