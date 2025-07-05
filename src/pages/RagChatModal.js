// src/components/ChatModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, X, BookOpen, Search, ArrowRight } from 'lucide-react';

const ChatModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "مرحبًا بك في BookShare الذكاء الاصطناعي! هل يمكنني مساعدتك في شيء اليوم؟", 
      sender: 'bot' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // دالة للتمرير إلى أحدث رسالة
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // دالة إرسال الرسالة
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // إضافة رسالة المستخدم
    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // محاكاة استدعاء API للذكاء الاصطناعي
      const response = await simulateAIResponse(inputValue);
      
      // إضافة رد المساعد
      setMessages(prev => [...prev, response]);
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        text: "عذرًا، حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        sender: 'bot',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // محاكاة رد الذكاء الاصطناعي
  const simulateAIResponse = async (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // تحديد نوع السؤال والرد المناسب
        let response;
        
        if (query.toLowerCase().includes("hello") || 
            query.includes("مرحب") || 
            query.includes("اهلا")) {
          response = {
            id: Date.now(),
            text: "مرحبًا بك! كيف يمكنني مساعدتك اليوم؟",
            sender: 'bot'
          };
        } 
        else if (query.toLowerCase().includes("frontend") || 
                 query.includes("واجهة") || 
                 query.includes("فرونت")) {
          response = {
            id: Date.now(),
            text: "إليك بعض الكتب المميزة في مجال تطوير واجهات المستخدم:",
            sender: 'bot',
            books: [
              {
                id: 1,
                title: "HTML & CSS: Design and Build Websites",
                author: "Jon Duckett",
                price: "120 ج.م",
                url: "#"
              },
              {
                id: 2,
                title: "JavaScript: The Definitive Guide",
                author: "David Flanagan",
                price: "150 ج.م",
                url: "#"
              },
              {
                id: 3,
                title: "React - The Complete Guide",
                author: "Maximilian Schwarzmüller",
                price: "180 ج.م",
                url: "#"
              }
            ]
          };
        }
        else if (query.toLowerCase().includes("fiction") || 
                 query.includes("خيال") || 
                 query.includes("روايات")) {
          response = {
            id: Date.now(),
            text: "إليك أفضل الروايات الخيالية لدينا:",
            sender: 'bot',
            books: [
              {
                id: 4,
                title: "Harry Potter and the Sorcerer's Stone",
                author: "J.K. Rowling",
                price: "100 ج.م",
                url: "#"
              },
              {
                id: 5,
                title: "The Lord of the Rings",
                author: "J.R.R. Tolkien",
                price: "140 ج.م",
                url: "#"
              },
              {
                id: 6,
                title: "1984",
                author: "George Orwell",
                price: "90 ج.م",
                url: "#"
              }
            ]
          };
        }
        else if (query.toLowerCase().includes("help") || 
                 query.includes("مساعدة") || 
                 query.includes("مساعدة")) {
          response = {
            id: Date.now(),
            text: "أنا هنا لمساعدتك! يمكنني:\n1- البحث عن كتب في مجالات محددة\n2- اقتراح كتب حسب اهتماماتك\n3- الإجابة على أسئلتك حول المنصة\n\nما الذي تبحث عنه بالضبط؟",
            sender: 'bot'
          };
        }
        else {
          response = {
            id: Date.now(),
            text: "عذرًا، لم أفهم سؤالك. يمكنك أن تسأل عن:\n- كتب في مجال معين (مثل: كتب برمجة)\n- روايات خيالية\n- كتب تعليمية\n- أو أي استفسار آخر عن المنصة",
            sender: 'bot'
          };
        }
        
        resolve(response);
      }, 1000);
    });
  };

  // دالة للتعامل مع الضغط على Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* زر الشات العائم */}
      <button 
        className={`floating-chat-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <BookOpen size={20} />
      </button>

      {/* نافذة الشات المنبثقة */}
      {isOpen && (
        <div className="chat-modal">
          <div className="chat-header">
            <div className="chat-title">
              <BookOpen size={18} className="icon" />
              <h3>مساعد BookShare الذكي</h3>
            </div>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                {message.sender === 'bot' && (
                  <div className="bot-avatar">B</div>
                )}
                
                <div className="message-content">
                  <div className="message-text">
                    {message.text.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  
                  {message.books && (
                    <div className="book-suggestions">
                      <p className="suggestion-title">كتب مقترحة:</p>
                      <div className="books-grid">
                        {message.books.map(book => (
                          <a 
                            key={book.id} 
                            href={book.url} 
                            className="book-card"
                          >
                            <div className="book-image">
                              <div className="placeholder"></div>
                            </div>
                            <div className="book-details">
                              <h4 className="book-title">{book.title}</h4>
                              <p className="book-author">{book.author}</p>
                              <p className="book-price">{book.price}</p>
                              <div className="view-details">
                                <span>عرض التفاصيل</span>
                                <ArrowRight size={14} />
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message bot">
                <div className="bot-avatar">B</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب سؤالك هنا..."
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputValue.trim()}
              className="send-button"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatModal;