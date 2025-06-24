import React from "react";
import { useNavigate } from "react-router-dom";
import useTranslation from '../hooks/useTranslation';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
      padding: "2rem"
    }}>
      <img
        src="https://static.vecteezy.com/system/resources/previews/053/173/315/non_2x/illustration-of-404-not-found-with-people-engaged-in-activities-realizing-the-page-they-are-trying-to-reach-is-down-illustrated-with-the-404-error-text-free-vector.jpg"
        alt="404 Not Found"
        style={{ width: 260, marginBottom: 32 }}
      />
      <h1 style={{ fontSize: "5rem", fontWeight: 900, color: "#6366f1", margin: 0 }}>{t('notFoundTitle')}</h1>
      <h2 style={{ color: "#1e293b", margin: "1rem 0 0.5rem 0", fontWeight: 700 }}>{t('notFoundSubtitle')}</h2>
      <p style={{ color: "#64748b", fontSize: "1.2rem", marginBottom: 32, textAlign: "center", maxWidth: 400 }}>
        {t('notFoundDescription')}
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          background: "#6366f1",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "0.75rem 2rem",
          fontSize: "1.1rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(99,102,241,0.15)",
          transition: "background 0.2s"
        }}
        onMouseOver={e => (e.target.style.background = '#4338ca')}
        onMouseOut={e => (e.target.style.background = '#6366f1')}
      >
        {t('goHomeButton')}
      </button>
    </div>
  );
};

export default NotFound; 