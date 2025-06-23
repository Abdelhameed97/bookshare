import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Search,
  Filter,
  Calendar,
  Star,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Bell,
  TrendingDown,
  Activity,
  User
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Dashboard.css';
import Navbar from '../HomePage/Navbar';
import Footer from '../HomePage/Footer';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    weeklyOrders: 0,
    availableBooks: 0,
    rentedBooks: 0
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // Memoized filtered and sorted books
  const filteredBooks = useMemo(() => {
    let filtered = allBooks.filter(book => book.user_id === currentUser?.id);
    
    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(book => book.status === filterStatus);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(book => book.category_id === parseInt(filterCategory));
    }
    
    // Sort books
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          comparison = parseFloat(a.price) - parseFloat(b.price);
          break;
        case 'date':
          comparison = new Date(b.created_at) - new Date(a.created_at);
          break;
        case 'rating':
          const ratingA = a.ratings?.length ? a.ratings.reduce((acc, r) => acc + r.rating, 0) / a.ratings.length : 0;
          const ratingB = b.ratings?.length ? b.ratings.reduce((acc, r) => acc + r.rating, 0) / b.ratings.length : 0;
          comparison = ratingB - ratingA;
          break;
        default:
          comparison = new Date(b.created_at) - new Date(a.created_at);
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [allBooks, currentUser, searchTerm, filterStatus, filterCategory, sortBy, sortOrder]);

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = allOrders.filter(order => 
      order.order_items.some(item => 
        allBooks.some(book => book.id === item.book_id && book.user_id === currentUser?.id)
      )
    );
    
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getFullYear(), now.getMonth(), 1),
        year: new Date(now.getFullYear(), 0, 1)
      };
      
      if (timeRanges[selectedTimeRange]) {
        filtered = filtered.filter(order => 
          new Date(order.created_at) >= timeRanges[selectedTimeRange]
        );
      }
    }
    
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [allOrders, allBooks, currentUser, selectedTimeRange]);

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [booksResponse, ordersResponse, categoriesResponse, notificationsResponse] = await Promise.all([
        api.get('/books'),
        api.get('/orders'),
        api.get('/categories'),
        api.get('/notifications')
      ]);
      
      const userBooks = booksResponse.data.data.filter(book => book.user_id === currentUser.id);
      const userOrders = ordersResponse.data.data.filter(order => 
        order.order_items.some(item => 
          userBooks.some(book => book.id === item.book_id)
        )
      );

      // Calculate comprehensive stats
      const totalRevenue = userOrders.reduce((sum, order) => {
        return sum + order.order_items.reduce((itemSum, item) => {
          const book = userBooks.find(b => b.id === item.book_id);
          return itemSum + (book ? parseFloat(book.price) * item.quantity : 0);
        }, 0);
      }, 0);

      const uniqueCustomers = new Set(userOrders.map(order => order.user_id)).size;
      
      // Calculate monthly revenue
      const currentMonth = new Date().getMonth();
      const monthlyOrders = userOrders.filter(order => 
        new Date(order.created_at).getMonth() === currentMonth
      );
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => {
        return sum + order.order_items.reduce((itemSum, item) => {
          const book = userBooks.find(b => b.id === item.book_id);
          return itemSum + (book ? parseFloat(book.price) * item.quantity : 0);
        }, 0);
      }, 0);

      // Calculate weekly orders
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyOrders = userOrders.filter(order => 
        new Date(order.created_at) >= oneWeekAgo
      ).length;

      // Count books by status
      const availableBooks = userBooks.filter(book => book.status === 'available').length;
      const rentedBooks = userBooks.filter(book => book.status === 'rented').length;

      setStats({
        totalBooks: userBooks.length,
        totalOrders: userOrders.length,
        totalRevenue: totalRevenue.toFixed(2),
        totalCustomers: uniqueCustomers,
        monthlyRevenue: monthlyRevenue.toFixed(2),
        weeklyOrders,
        availableBooks,
        rentedBooks
      });

      // Set all books with processed images
      setAllBooks(userBooks.map(book => ({
        ...book,
        image: book.images?.[0] 
          ? book.images[0].startsWith('http') 
            ? book.images[0] 
            : `http://localhost:8000/storage/${book.images[0]}`
          : '/placeholder.svg'
      })));

      setAllOrders(userOrders);
      setRecentBooks(userBooks.slice(0, 5).map(book => ({
        ...book,
        image: book.images?.[0] 
          ? book.images[0].startsWith('http') 
            ? book.images[0] 
            : `http://localhost:8000/storage/${book.images[0]}`
          : '/placeholder.svg'
      })));
      setRecentOrders(userOrders.slice(0, 5));
      
      // Set notifications
      const userNotifications = notificationsResponse.data.data.filter(
        notification => notification.user_id === currentUser.id
      );
      setNotifications(userNotifications.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleExportData = async () => {
    try {
      const data = {
        stats,
        books: filteredBooks,
        orders: filteredOrders,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: 'Dashboard data has been exported successfully!'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Failed to export dashboard data'
      });
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    if (!selectedIds.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select items to perform bulk action'
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: `Confirm ${action}`,
        text: `Are you sure you want to ${action} ${selectedIds.length} item(s)?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: `Yes, ${action} them!`
      });

      if (result.isConfirmed) {
        // Implement bulk actions here
        await Promise.all(selectedIds.map(id => 
          api.delete(`/books/${id}`)
        ));
        
        await fetchDashboardData();
        
        Swal.fire(
          'Success!',
          `Successfully ${action}ed ${selectedIds.length} item(s).`,
          'success'
        );
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${action} items`
      });
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [currentUser, location.pathname, fetchDashboardData]);

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData();
      }, refreshInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  // Add effect to reload data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser && currentUser.role === 'owner') {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser, fetchDashboardData]);

  const handleDeleteBook = async (bookId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await api.delete(`/books/${bookId}`);
        await fetchDashboardData();
        
        Swal.fire(
          'Deleted!',
          'Your book has been deleted.',
          'success'
        );
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete book'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'rented': return '#F59E0B';
      case 'sold': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Library Dashboard</h1>
            <p>Welcome back, {currentUser?.name || 'Library Owner'}</p>
            <div className="dashboard-subtitle">
              <Activity size={16} />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="dashboard-actions">
            <div className="action-group">
              <button 
                className={`btn-toggle ${autoRefresh ? 'active' : ''}`}
                onClick={handleAutoRefreshToggle}
                title={autoRefresh ? 'Disable Auto Refresh' : 'Enable Auto Refresh'}
              >
                <RefreshCw size={20} className={autoRefresh ? 'spinning' : ''} />
                {autoRefresh ? 'Auto ON' : 'Auto OFF'}
              </button>
              
              <button 
                className="btn-secondary"
                onClick={handleExportData}
                title="Export Data"
              >
                <Download size={20} />
                Export
              </button>
              
              <button 
                className="btn-refresh"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh Data"
              >
                <RefreshCw size={20} className={refreshing ? 'spinning' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            <div className="notification-section">
              <button 
                className="btn-notification"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  {notifications.map(notification => (
                    <div key={notification.id} className="notification-item">
                      <p>{notification.message}</p>
                      <small>{new Date(notification.created_at).toLocaleDateString()}</small>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="no-notifications">No new notifications</p>
                  )}
                </div>
              )}
            </div>
            
            <Link to="/edit-profile" className="btn-secondary">
              <User size={20} />
              Edit Profile
            </Link>
            
            <Link to="/add-book" className="btn-primary">
              <Plus size={20} />
              Add New Book
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon books">
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalBooks}</h3>
              <p>Total Books</p>
              <div className="stat-details">
                <span className="available">{stats.availableBooks} available</span>
                <span className="rented">{stats.rentedBooks} rented</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
              <div className="stat-details">
                <span className="weekly">{stats.weeklyOrders} this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3>${stats.totalRevenue}</h3>
              <p>Total Revenue</p>
              <div className="stat-details">
                <span className="monthly">${stats.monthlyRevenue} this month</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon customers">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalCustomers}</h3>
              <p>Total Customers</p>
              <div className="stat-details">
                <span className="unique">Unique customers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search books by title, author, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="sold">Sold</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
            </select>
            
            <button 
              className="btn-sort"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Dynamic Books Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Books ({filteredBooks.length})</h2>
            <div className="section-actions">
              <select 
                value={selectedTimeRange} 
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="time-filter"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <Link to="/books" className="view-all-link">
                View All Books
              </Link>
            </div>
          </div>

          <div className="books-grid">
            {filteredBooks.slice(0, 8).map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-image">
                  <img 
                    src={book.image} 
                    alt={book.title}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="book-status" style={{ backgroundColor: getStatusColor(book.status) }}>
                    {book.status}
                  </div>
                  <div className="book-overlay">
                    <div className="overlay-actions">
                      <button 
                        className="overlay-btn view"
                        onClick={() => navigate(`/books/${book.id}`)}
                        title="View Book"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="overlay-btn edit"
                        onClick={() => navigate(`/edit-book/${book.id}`)}
                        title="Edit Book"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="overlay-btn delete"
                        onClick={() => handleDeleteBook(book.id)}
                        title="Delete Book"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="book-author">By {book.user?.name || 'Unknown'}</p>
                  <div className="book-rating">
                    <Star size={16} fill="#FBBF24" />
                    <span>{book.ratings?.length ? (book.ratings.reduce((acc, r) => acc + r.rating, 0) / book.ratings.length).toFixed(1) : '0'}</span>
                    <span className="rating-count">({book.ratings?.length || 0})</span>
                  </div>
                  <p className="book-price">${book.price}</p>
                  <p className="book-date">Added: {new Date(book.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          {filteredBooks.length === 0 && (
            <div className="empty-state">
              <BookOpen size={48} />
              <p>No books found matching your criteria</p>
              <button 
                className="btn-primary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterCategory('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Orders Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders ({filteredOrders.length})</h2>
            <Link to="/order" className="view-all-link">
              View All Orders
            </Link>
          </div>

          <div className="orders-table">
            <div className="table-header">
              <div className="header-cell">Order ID</div>
              <div className="header-cell">Customer</div>
              <div className="header-cell">Books</div>
              <div className="header-cell">Total</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Actions</div>
            </div>
            
            {filteredOrders.slice(0, 10).map((order) => (
              <div key={order.id} className="table-row">
                <div className="table-cell">#{order.id}</div>
                <div className="table-cell">{order.user?.name || 'Unknown'}</div>
                <div className="table-cell">
                  {order.order_items.length} book{order.order_items.length !== 1 ? 's' : ''}
                </div>
                <div className="table-cell">
                  ${order.order_items.reduce((sum, item) => {
                    const book = allBooks.find(b => b.id === item.book_id);
                    return sum + (book ? parseFloat(book.price) * item.quantity : 0);
                  }, 0).toFixed(2)}
                </div>
                <div className="table-cell">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getOrderStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="table-cell">
                  {new Date(order.created_at).toLocaleDateString()}
                </div>
                <div className="table-cell">
                  <button 
                    className="action-btn view"
                    onClick={() => navigate(`/order/${order.id}`)}
                    title="View Order"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredOrders.length === 0 && (
              <div className="empty-state">
                <TrendingUp size={48} />
                <p>No orders found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard; 