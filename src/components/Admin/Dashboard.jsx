import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from '../HomePage/Navbar';
import Footer from '../HomePage/Footer';
import './Dashboard.css';
// استيراد أيقونات FontAwesome
import { FaBook, FaUsers, FaLayerGroup, FaUniversity, FaSyncAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get("http://localhost:8000/api/admin/stats");
      setStats(res.data);
    } catch (err) {
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin!</p>
            <div className="dashboard-subtitle">
              <FaUniversity size={16} />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              {refreshing && <span className="updating-indicator"> • Updating...</span>}
            </div>
          </div>
          <div className="dashboard-actions">
            <button 
              className="btn-refresh"
              onClick={fetchStats}
              disabled={refreshing}
              title="Refresh Data"
            >
              <FaSyncAlt size={20} className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon libraries">
              <FaUniversity size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.libraries}</h3>
              <p>Total Libraries</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon clients">
              <FaUsers size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.clients}</h3>
              <p>Total Clients</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon books">
              <FaBook size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.books}</h3>
              <p>Total Books</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon categories">
              <FaLayerGroup size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.categories}</h3>
              <p>Total Categories</p>
            </div>
          </div>
        </div>
    </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;