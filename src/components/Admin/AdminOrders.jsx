import React, { useEffect, useState } from 'react';
import api from '../../api/auth';
import Navbar from '../HomePage/Navbar';
import Footer from '../HomePage/Footer';
import Swal from 'sweetalert2';
import { FaUserCircle, FaBookOpen, FaRegClock } from 'react-icons/fa';
import '../../style/AllOrdersPage.css';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await api.get('/orders');
        setOrders(response.data.data || []);
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders.filter(order => order.status === activeTab);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(order =>
        order.user?.name?.toLowerCase().includes(s) ||
        order.id.toString().includes(s) ||
        (order.order_items && order.order_items.some(item => item.book?.title?.toLowerCase().includes(s)))
      );
    }
    setFilteredOrders(filtered);
  }, [orders, activeTab, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

  const handleStatusChange = async (orderId, action) => {
    let apiCall, confirmText, successText;
    if (action === 'accept') {
      apiCall = () => api.post(`/orders/${orderId}/accept`);
      confirmText = 'Are you sure you want to accept this order?';
      successText = 'Order accepted!';
    } else if (action === 'reject') {
      apiCall = () => api.post(`/orders/${orderId}/reject`);
      confirmText = 'Are you sure you want to reject this order?';
      successText = 'Order rejected!';
    } else if (action === 'restore') {
      apiCall = () => api.post(`/orders/${orderId}/accept`);
      confirmText = 'Are you sure you want to restore this order?';
      successText = 'Order restored!';
    } else {
      return;
    }
    const result = await Swal.fire({
      title: 'Confirm',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });
    if (result.isConfirmed) {
      try {
        await apiCall();
        setOrders(prev => prev.map(order =>
          order.id === orderId
            ? { ...order, status: action === 'accept' || action === 'restore' ? 'accepted' : 'rejected' }
            : order
        ));
        Swal.fire('Success', successText, 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to update order', 'error');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="all-orders-container">
        <h2 className="orders-title">All Orders</h2>
        <div className="tabs-search-row">
          <div className="tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="orders-search-input"
            placeholder="Search by customer, order ID, or book title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Books</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">No orders in this tab.</td>
                  </tr>
                ) : (
                  paginatedOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <FaUserCircle className="orders-icon user" />
                        {order.client?.name || order.user?.name || 'Unknown'}
                      </td>
                      <td>
                        <ul className="orders-books-list">
                          {order.order_items?.map(item => (
                            <li key={item.id}>
                              <FaBookOpen className="orders-icon book" />
                              {item.book?.title || 'Book'} x{item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>{order.total_price || 0} EGP</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>{order.status}</span>
                      </td>
                      <td>
                        <FaRegClock className="orders-icon clock" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="actions-cell">
                          {order.status === 'pending' && (
                            <>
                              <button
                                className="action-btn accept"
                                onClick={() => handleStatusChange(order.id, 'accept')}
                              >Accept</button>
                              <button
                                className="action-btn reject"
                                onClick={() => handleStatusChange(order.id, 'reject')}
                              >Reject</button>
                            </>
                          )}
                          {order.status === 'cancelled' && (
                            <button
                              className="action-btn restore"
                              onClick={() => handleStatusChange(order.id, 'restore')}
                            >Accept</button>
                          )}
                          {order.status === 'rejected' && (
                            <button
                              className="action-btn accept"
                              onClick={() => handleStatusChange(order.id, 'accept')}
                            >Accept</button>
                          )}
                          {order.status === 'accepted' && (
                            <button
                              className="action-btn reject"
                              onClick={() => handleStatusChange(order.id, 'reject')}
                            >Reject</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminOrders; 