import React, { useState, useEffect, useMemo } from 'react';
import { Bell, ArrowLeft, Filter, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import Swal from 'sweetalert2';
import './NotificationsPage.css';
import '../../style/Notifications.css';
import Navbar from '../HomePage/Navbar';
import Footer from '../HomePage/Footer';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFirstNotification, setShowFirstNotification] = useState(false);
  const notificationsPerPage = 6;
  
  const navigate = useNavigate();
  
  // Memoize currentUser to prevent unnecessary re-renders
  const currentUser = useMemo(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  // Memoized filtered notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.message?.toLowerCase().includes(searchLower) ||
        notification.user?.name?.toLowerCase().includes(searchLower) ||
        notification.client?.name?.toLowerCase().includes(searchLower) ||
        notification.order_items?.some(item => 
          item.book?.title?.toLowerCase().includes(searchLower)
        )
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(notification => notification.status === filterStatus);
    }
    
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [notifications, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * notificationsPerPage;
    return filteredNotifications.slice(start, start + notificationsPerPage);
  }, [filteredNotifications, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Auto-show first notification when notifications are loaded
  useEffect(() => {
    if (filteredNotifications.length > 0 && !showFirstNotification) {
      setShowFirstNotification(true);
      // Show a toast or alert for the first notification
      const firstNotification = filteredNotifications[0];
      if (firstNotification.type === 'order') {
        const userName = firstNotification.user?.name || firstNotification.client?.name || 'Someone';
        const firstBook = firstNotification.order_items?.[0]?.book?.title || 'a book';
        Swal.fire({
          title: 'New Book Request!',
          html: `<p><strong>${userName}</strong> has requested <strong>"${firstBook}"</strong></p>`,
          icon: 'info',
          confirmButtonText: 'View Details',
          showCancelButton: true,
          cancelButtonText: 'Close'
        }).then((result) => {
          if (result.isConfirmed) {
            // Scroll to the first notification
            const firstNotificationElement = document.querySelector('.notification-card');
            if (firstNotificationElement) {
              firstNotificationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        });
      }
    }
  }, [filteredNotifications, showFirstNotification]);

  const fetchNotificationsData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      console.log('Fetching notifications data for user:', currentUser.id);
      
      // Fetch all data in parallel
      const [ordersResponse, booksResponse, notificationsResponse] = await Promise.allSettled([
        apiService.getOrders(),
        apiService.getBooks(),
        apiService.getNotifications()
      ]);
      
      // Handle successful responses
      const userBooks = booksResponse.status === 'fulfilled' && booksResponse.value.data.data 
        ? booksResponse.value.data.data.filter(book => book.user_id === currentUser.id)
        : [];
      
      const userOrders = ordersResponse.status === 'fulfilled' && ordersResponse.value.data.data 
        ? ordersResponse.value.data.data.filter(order => 
          order.order_items.some(item => 
            userBooks.some(book => book.id === item.book_id)
          )
        )
        : [];

      // Get user notifications
      const userNotifications = notificationsResponse.status === 'fulfilled' && notificationsResponse.value.data.data 
        ? notificationsResponse.value.data.data.filter(
            notification => notification.user_id === currentUser.id
          )
        : [];

      // Combine order notifications with regular notifications
      const orderNotifications = userOrders.map(order => ({
        id: `order-${order.id}`,
        type: 'order',
        status: order.status,
        message: `Order #${order.id} - ${order.status}`,
        user: order.user,
        client: order.client,
        order_items: order.order_items,
        created_at: order.created_at,
        updated_at: order.updated_at
      }));

      const allNotifications = [...userNotifications, ...orderNotifications];
      
      console.log('Debug - User Books:', userBooks);
      console.log('Debug - User Orders:', userOrders);
      console.log('Debug - Order Items Sample:', userOrders[0]?.order_items);
      console.log('Debug - Book Sample:', userBooks[0]);
      
      setNotifications(allNotifications);
      setAllOrders(userOrders);
      setAllBooks(userBooks);

    } catch (error) {
      console.error('Error fetching notifications data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load notifications'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', { orderId, newStatus });
      
      let response;
      if (newStatus === 'accepted') {
        response = await apiService.post(`/orders/${orderId}/accept`);
      } else if (newStatus === 'rejected') {
        response = await apiService.post(`/orders/${orderId}/reject`);
      } else {
        response = await apiService.put(`/orders/${orderId}`, { status: newStatus });
      }
      
      console.log('Update response:', response);
      
      await fetchNotificationsData();
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Order ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully!`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to update order status';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.type === 'order') {
      return '📚';
    }
    return '🔔';
  };

  const getNotificationMessage = (notification) => {
    if (notification.type === 'order') {
      const userName = notification.user?.name || notification.client?.name || 'Someone';
      const firstBook = notification.order_items?.[0]?.book?.title || 'a book';
      const moreCount = notification.order_items?.length > 1 ? notification.order_items.length - 1 : 0;
      
      return (
        <div className="notification-message">
          <span className="notif-user">{userName}</span>
          <span> requested </span>
          <span className="notif-book">"{firstBook}"</span>
          {moreCount > 0 && (
            <span> and <span className="notif-more">{moreCount} more</span></span>
          )}
        </div>
      );
    }
    
    return <span>{notification.message || 'New notification'}</span>;
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/login');
      return;
    }
    
    fetchNotificationsData();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="notifications-container">
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-title">
            <Link to="/dashboard" className="back-button">
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
            <div className="title-content">
              <Bell size={32} />
              <div>
                <h1>Notifications</h1>
                <p>Manage your library notifications and order requests</p>
              </div>
            </div>
          </div>
          <div className="notifications-stats">
            <div className="stat-item">
              <span className="stat-number">{notifications.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{notifications.filter(n => n.status === 'pending').length}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{notifications.filter(n => n.status === 'completed').length}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="filter-controls">
            <Filter size={20} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            {filteredNotifications.length > 0 && (
              <button 
                className="btn-show-first"
                onClick={() => {
                  setShowFirstNotification(false);
                  setTimeout(() => setShowFirstNotification(true), 100);
                }}
                title="Show first notification"
              >
                🔔 Show Latest
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-section">
          {paginatedNotifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} />
              <p>{loading ? 'Loading notifications...' : 'No notifications found'}</p>
              {!loading && searchTerm && (
                <button 
                  className="btn-primary"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="notifications-list">
                {paginatedNotifications.map((notification, index) => (
                  <div 
                    key={notification.id} 
                    className={`notification-card ${index === 0 && showFirstNotification ? 'first-notification' : ''}`}
                  >
                    <div className="notification-header">
                      <div className="notification-icon">
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-main">
                          {getNotificationMessage(notification)}
                        </div>
                        <div className="notification-meta">
                          <span className="notification-date">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(notification.status) }}
                          >
                            {notification.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {notification.type === 'order' && (
                      <div className="order-details">
                        <div className="order-items">
                          {notification.order_items?.map((item, index) => {
                            const book = allBooks.find(b => b.id === item.book_id);
                            const author = book?.author || book?.user?.name || item.book?.author || item.book?.user?.name || 'Unknown Author';
                            return (
                              <div key={index} className="order-item">
                                <div className="book-info">
                                  <span className="book-title">{book?.title || item.book?.title || 'Unknown Book'}</span>
                                  <span className="book-author">Author: {author}</span>
                                  <span className="quantity">Qty: {item.quantity}</span>
                                </div>
                                <div className="book-price">${book?.price || item.book?.price || '0'}</div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {notification.status === 'pending' && (
                          <div className="order-actions">
                            <button 
                              className="btn-accept"
                              onClick={() => {
                                const orderId = notification.type === 'order' ? notification.id.replace('order-', '') : notification.id;
                                handleUpdateOrderStatus(orderId, 'accepted');
                              }}
                            >
                              <CheckCircle size={16} />
                              Accept
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => {
                                const orderId = notification.type === 'order' ? notification.id.replace('order-', '') : notification.id;
                                handleUpdateOrderStatus(orderId, 'rejected');
                              }}
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        )}
                        
                        {notification.status === 'cancelled' && (
                          <div className="order-actions">
                            <span className="text-muted">No actions available for cancelled order</span>
                          </div>
                        )}
                        
                        <div className="order-total">
                          <span>Total: ${notification.order_items?.reduce((sum, item) => {
                            const book = allBooks.find(b => b.id === item.book_id);
                            const price = book?.price || item.book?.price || 0;
                            return sum + (parseFloat(price) * item.quantity);
                          }, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    {'<'}
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      className={currentPage === idx + 1 ? 'active' : ''}
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    {'>'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotificationsPage; 