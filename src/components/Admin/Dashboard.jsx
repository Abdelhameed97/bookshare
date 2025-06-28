import React, { useEffect, useState } from 'react';
import { BookOpen, Users, ShoppingCart, TrendingUp, ClipboardList, User, RefreshCw, Building2, Bell } from 'lucide-react';
import Navbar from '../HomePage/Navbar';
import Footer from '../HomePage/Footer';
import api from '../../api/auth';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../style/AdminDashboard.css';
import '../../style/Notifications.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalLibraries: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [booksRes, ordersRes, usersRes, librariesRes] = await Promise.all([
        api.get('/books'),
        api.get('/orders'),
        api.get('/users'),
        api.get('/users?role=owner'),
      ]);
      setStats({
        totalBooks: booksRes.data.data?.length || 0,
        totalOrders: ordersRes.data.data?.length || 0,
        totalUsers: usersRes.data.data?.length || 0,
        totalLibraries: librariesRes.data.data?.length || 0,
      });
      // Only show last 3 pending orders
      const pending = (ordersRes.data.data || [])
        .filter(order => order.status === 'pending')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPendingOrders(pending);
      setRecentOrders(pending.slice(0, 3));
    } catch (error) {
      Swal.fire('Error', 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <h1>Admin Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div className="admin-notification-section">
              <button className="admin-notification-btn" onClick={() => setShowNotifications(v => !v)}>
                <Bell size={32} />
                {pendingOrders.length > 0 && (
                  <span className="admin-notification-badge">{pendingOrders.length}</span>
                )}
              </button>
              {showNotifications && (
                <div className="notifications-dropdown">
                  <h4>New Book Requests</h4>
                  <div className="notifications-scroll-container">
                    {pendingOrders.length === 0 ? (
                      <div className="no-notifications">No new requests</div>
                    ) : (
                      pendingOrders.slice(0, 2).map(order => {
                        const userName = order.user?.name || order.client?.name || 'Someone';
                        const firstBook = order.order_items?.[0]?.book?.title || 'a book';
                        const moreCount = order.order_items?.length > 1 ? order.order_items.length - 1 : 0;
                        return (
                          <div key={order.id} className="notification-item">
                            <div className="notification-row">
                              <span className="notif-icon">📚</span>
                              <span className="notification-message">
                                <span className="notif-user">{userName}</span>
                                <span> requested </span>
                                <span className="notif-book">"{firstBook}"</span>
                                {moreCount > 0 && (
                                  <span> and <span className="notif-more">{moreCount} more</span></span>
                                )}
                              </span>
                            </div>
                            <div className="notification-meta">
                              <small>{new Date(order.created_at).toLocaleString()}</small>
                              <button
                                className="notification-link-btn"
                                onClick={() => navigate('/admin/orders')}
                              >View</button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {pendingOrders.length > 2 && (
                    <div className="view-all-notifications">
                      <Link to="/admin/notifications" className="view-all-link">
                        View All Notifications ({pendingOrders.length})
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="admin-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={28} className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="admin-stats-grid">
          <div className="admin-stat-card books">
            <BookOpen size={48} />
            <div>
              <h3>{stats.totalBooks}</h3>
              <p>Total Books</p>
            </div>
          </div>
          <div className="admin-stat-card orders">
            <ClipboardList size={48} />
            <div>
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="admin-stat-card users">
            <Users size={48} />
            <div>
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="admin-stat-card libraries">
            <Building2 size={48} />
            <div>
              <h3>{stats.totalLibraries}</h3>
              <p>Total Libraries</p>
            </div>
          </div>
        </div>
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Recent Pending Orders</h2>
            <Link to="/admin/orders" className="view-all-link">View All Orders</Link>
          </div>
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Books</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : recentOrders.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No recent pending orders.</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user?.name || order.client?.name || 'Unknown'}</td>
                      <td>
                        <ul className="admin-orders-books-list">
                          {order.order_items?.map(item => (
                            <li key={item.id}>{item.book?.title || 'Book'} x{item.quantity}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>{order.status}</span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;