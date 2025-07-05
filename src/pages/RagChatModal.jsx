import React, { useState } from "react"
import RagChat from "./RagChat"
import "../style/RagChatModal.css"

export default function RagChatModal() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button className="open-ragchat-btn" onClick={() => setIsOpen(true)}>
                🔍 Open Bookshare Chat
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>📚 Bookshare Helper</h4>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>
                                ✖
                            </button>
                        </div>

                        <div className="modal-body">
                            <RagChat />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
