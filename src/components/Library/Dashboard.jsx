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
  Star,
  Bell,
  Activity,
  User
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
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
    rentedBooks: 0,
    soldBooks: 0,
    booksByCategory: {}
  });
  const [allBooks, setAllBooks] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 6;
  
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
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        book.description?.toLowerCase().includes(searchLower) ||
        book.author?.toLowerCase().includes(searchLower) ||
        book.genre?.toLowerCase().includes(searchLower) ||
        book.category?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(book => book.status === filterStatus);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(book => book.category?.name === filterCategory);
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

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * booksPerPage;
    return filteredBooks.slice(start, start + booksPerPage);
  }, [filteredBooks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, sortBy, sortOrder]);

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = allOrders.filter(order => 
      order.order_items.some(item => 
        allBooks.some(book => book.id === item.book_id && book.user_id === currentUser?.id)
      )
    );
    
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [allOrders, allBooks, currentUser]);

  // Get only pending orders for this library's books
  const pendingOrders = useMemo(() =>
    allOrders.filter(order => order.status === 'pending'),
    [allOrders]
  );

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      console.log('Fetching dashboard data for user:', currentUser.id);
      
      // Fetch all data in parallel
      const [booksResponse, ordersResponse, categoriesResponse] = await Promise.allSettled([
        apiService.getBooks(),
        apiService.getOrders(),
        apiService.getCategories()
      ]);
      
      console.log('Books response:', booksResponse);
      console.log('Orders response:', ordersResponse);
      
      // Handle successful responses
      const userBooks = booksResponse.status === 'fulfilled' && booksResponse.value.data.data 
        ? booksResponse.value.data.data.filter(book => book.user_id === currentUser.id)
        : [];
      console.log('User books:', userBooks);
      
      const userOrders = ordersResponse.status === 'fulfilled' && ordersResponse.value.data.data 
        ? ordersResponse.value.data.data.filter(order => 
        order.order_items.some(item => 
          userBooks.some(book => book.id === item.book_id)
        )
          )
        : [];
      console.log('User orders:', userOrders);

      // Log any failed API calls
      if (booksResponse.status === 'rejected') {
        console.error('Failed to fetch books:', booksResponse.reason);
      }
      if (ordersResponse.status === 'rejected') {
        console.error('Failed to fetch orders:', ordersResponse.reason);
      }
      if (categoriesResponse.status === 'rejected') {
        console.error('Failed to fetch categories:', categoriesResponse.reason);
      }

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
      const soldBooks = userBooks.filter(book => book.status === 'sold').length;
      
      // Count books by category
      const booksByCategory = userBooks.reduce((acc, book) => {
        const categoryName = book.category?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalBooks: userBooks.length,
        totalOrders: userOrders.length,
        totalRevenue: totalRevenue.toFixed(2),
        totalCustomers: uniqueCustomers,
        monthlyRevenue: monthlyRevenue.toFixed(2),
        weeklyOrders,
        availableBooks,
        rentedBooks,
        soldBooks,
        booksByCategory
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
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        console.log('No data found, setting empty arrays');
        setAllBooks([]);
        setAllOrders([]);
        setStats({
          totalBooks: 0,
          totalOrders: 0,
          totalRevenue: '0.00',
          totalCustomers: 0,
          monthlyRevenue: '0.00',
          weeklyOrders: 0,
          availableBooks: 0,
          rentedBooks: 0,
          soldBooks: 0,
          booksByCategory: {}
        });
      } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load dashboard data'
      });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
        await apiService.delete(`/books/${bookId}`);
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

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [currentUser, location.pathname, fetchDashboardData, navigate]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Debug prints for book arrays
  console.log('allBooks:', allBooks);
  console.log('filteredBooks:', filteredBooks);
  console.log('paginatedBooks:', paginatedBooks);

  // Helper function to get the correct book image URL
  const getBookImageUrl = (book) => {
    let img = book.images && book.images.length > 0 ? book.images[0] : book.image;
    if (!img) return '/placeholder.svg';
    if (img.startsWith('http')) return img;
    // If it's a relative path, prepend your backend URL (do not remove 'books/')
    return `http://localhost:8000/storage/${img}`;
  };

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
              {refreshing && <span className="updating-indicator"> • Updating...</span>}
            </div>
          </div>
          <div className="dashboard-actions">
            {/* Notification Bell */}
            <div className="notification-section">
              <button 
                className="btn-notification"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell size={24} />
                {pendingOrders.length > 0 && (
                  <span className="notification-badge">{pendingOrders.length}</span>
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
                              <Link to="/all-orders" className="notification-link-btn">View</Link>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {pendingOrders.length > 2 && (
                    <div className="view-all-notifications">
                      <Link to="/notifications" className="view-all-link">
                        View All Notifications ({pendingOrders.length})
                      </Link>
                    </div>
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
                {stats.soldBooks > 0 && <span className="sold">{stats.soldBooks} sold</span>}
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
              placeholder="Search books by title, author, description, or genre..."
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
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {Array.from(new Set(allBooks.map(book => book.category?.name).filter(Boolean))).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
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
              <Link to="/books" className="view-all-link">
                View All Books
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your books...</p>
            </div>
          ) : (
            <>
              {/* Forceful CSS override for visibility */}
              <style>{`
                .books-grid {
                  opacity: 1 !important;
                  z-index: 1000 !important;
                  position: relative !important;
                  background: #fff !important;
                  color: #000 !important;
                }
                .book-card {
                  opacity: 1 !important;
                  z-index: 1000 !important;
                  position: relative !important;
                  background: #fff !important;
                  color: #000 !important;
                }
                .book-image {
                  height: 200px !important;
                  min-height: 200px !important;
                  max-height: 200px !important;
                  overflow: hidden !important;
                  background: #f3f3f3 !important;
                }
                .book-image img {
                  width: 100% !important;
                  height: 100% !important;
                  object-fit: contain !important;
                  background: #f3f3f3 !important;
                  display: block !important;
                }
              `}</style>
              <div className="books-grid">
                {paginatedBooks.map((book) => {
                  const imgUrl = getBookImageUrl(book);
                  console.log('Render book:', {
                    id: book.id,
                    title: book.title,
                    images: book.images,
                    image: book.image,
                    imgUrl
                  });
                  return (
                    <div key={book.id} className="book-card">
                      <div className="book-image">
                        <img 
                          src={imgUrl} 
                          alt={book.title}
                          onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
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
                        <p className="book-author">By {book.author || book.user?.name || 'Unknown'}</p>
                        <div className="book-category">
                          <span className="category-badge">{book.category?.name || 'Uncategorized'}</span>
                        </div>
                        <div className="book-details">
                          <span className="detail-badge condition">{book.condition || 'Unknown'}</span>
                          {book.genre && <span className="detail-badge genre">{book.genre}</span>}
                          {book.educational_level && <span className="detail-badge level">{book.educational_level}</span>}
                        </div>
                        <div className="book-rating">
                          <Star size={16} fill="#FBBF24" />
                          <span>{book.ratings?.length ? (book.ratings.reduce((acc, r) => acc + r.rating, 0) / book.ratings.length).toFixed(1) : '0'}</span>
                          <span className="rating-count">({book.ratings?.length || 0})</span>
                        </div>
                        <div className="book-pricing">
                          <p className="book-price">${book.price}</p>
                          {book.rental_price && (
                            <p className="book-rental-price">Rent: ${book.rental_price}</p>
                          )}
                        </div>
                        <div className="book-meta">
                          <span className="quantity-badge">Qty: {book.quantity || 1}</span>
                          <p className="book-date">Added: {new Date(book.created_at).toLocaleDateString()}</p>
                        </div>
                        {book.description && (
                          <p className="book-description">{book.description.substring(0, 100)}...</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
              {filteredBooks.length === 0 && (
                <div className="empty-state">
                  <BookOpen size={48} />
                  <p>{loading ? 'Loading books...' : allBooks.length === 0 ? 'No books found in your library' : 'No books found matching your criteria'}</p>
                  {!loading && allBooks.length === 0 && (
                    <Link to="/add-book" className="btn-primary">
                      <Plus size={16} />
                      Add Your First Book
                    </Link>
                  )}
                  {!loading && allBooks.length > 0 && (
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
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Dynamic Orders Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders ({filteredOrders.filter(order => order.status === 'pending').length})</h2>
            <Link to="/all-orders" className="view-all-link" >
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
            {filteredOrders.filter(order => order.status === 'pending').slice(0, 4).map((order) => (
              <div key={order.id} className="table-row">
                <div className="table-cell">#{order.id}</div>
                <div className="table-cell">{order.client?.name || order.user?.name || 'Unknown'}</div>
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
              </div>
            ))}
            {filteredOrders.filter(order => order.status === 'pending').length === 0 && (
              <div className="empty-state">
                <TrendingUp size={48} />
                <p>No pending orders found.</p>
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


