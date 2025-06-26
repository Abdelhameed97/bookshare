import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react"; // أو استخدم أيقونة من FontAwesome أو Bootstrap

const FloatingChatButton = () => {
  return (
    <Link
      to="/rag-chat"
      className="floating-chat-btn"
      title="اسأل عن كتاب"
    >
      <MessageSquare size={22} />
    </Link>
  );
};

export default FloatingChatButton;
