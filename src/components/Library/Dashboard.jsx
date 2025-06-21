import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Dashboard.css';
import Navbar from '../HomePage/Navbar';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
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

  const fetchDashboardData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Fetch user's books
      const booksResponse = await api.get('/books');
      const userBooks = booksResponse.data.data.filter(book => book.user_id === currentUser.id);
      
      // Fetch orders for user's books
      const ordersResponse = await api.get('/orders');
      const userOrders = ordersResponse.data.data.filter(order => 
        order.order_items.some(item => 
          userBooks.some(book => book.id === item.book_id)
        )
      );

      // Calculate stats
      const totalRevenue = userOrders.reduce((sum, order) => {
        return sum + order.order_items.reduce((itemSum, item) => {
          const book = userBooks.find(b => b.id === item.book_id);
          return itemSum + (book ? parseFloat(book.price) * item.quantity : 0);
        }, 0);
      }, 0);

      const uniqueCustomers = new Set(userOrders.map(order => order.user_id)).size;

      setStats({
        totalBooks: userBooks.length,
        totalOrders: userOrders.length,
        totalRevenue: totalRevenue.toFixed(2),
        totalCustomers: uniqueCustomers
      });

      // Set recent books (last 5)
      setRecentBooks(userBooks.slice(0, 5).map(book => ({
        ...book,
        image: book.images?.[0] 
          ? book.images[0].startsWith('http') 
            ? book.images[0] 
            : `http://localhost:8000/storage/${book.images[0]}`
          : '/placeholder.svg'
      })));

      // Set recent orders (last 5)
      setRecentOrders(userOrders.slice(0, 5));

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
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [currentUser, location.pathname]); // Added location.pathname to reload when page changes

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
  }, [currentUser]);

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
          </div>
          <div className="dashboard-actions">
            <button 
              className="btn-refresh"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Data"
            >
              <RefreshCw size={20} className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link to="/add-book" className="btn-primary">
              <Plus size={20} />
              Add New Book
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon books">
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalBooks}</h3>
              <p>Total Books</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3>${stats.totalRevenue}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon customers">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalCustomers}</h3>
              <p>Total Customers</p>
            </div>
          </div>
        </div>

        {/* Recent Books Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Books</h2>
            <Link to="/books" className="view-all-link">
              View All Books
            </Link>
          </div>

          <div className="books-grid">
            {recentBooks.map((book) => (
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
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="book-author">By {book.user?.name || 'Unknown'}</p>
                  <div className="book-rating">
                    <Star size={16} fill="#FBBF24" />
                    <span>{book.ratings?.length ? (book.ratings.reduce((acc, r) => acc + r.rating, 0) / book.ratings.length).toFixed(1) : '0'}</span>
                  </div>
                  <p className="book-price">${book.price}</p>
                </div>
                <div className="book-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => navigate(`/books/${book.id}`)}
                    title="View Book"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteBook(book.id)}
                    title="Delete Book"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
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
            </div>
            
            {recentOrders.map((order) => (
              <div key={order.id} className="table-row">
                <div className="table-cell">#{order.id}</div>
                <div className="table-cell">{order.user?.name || 'Unknown'}</div>
                <div className="table-cell">
                  {order.order_items.length} book{order.order_items.length !== 1 ? 's' : ''}
                </div>
                <div className="table-cell">
                  ${order.order_items.reduce((sum, item) => {
                    const book = recentBooks.find(b => b.id === item.book_id);
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
              </div>
            ))}
            
            {recentOrders.length === 0 && (
              <div className="empty-state">
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard; 