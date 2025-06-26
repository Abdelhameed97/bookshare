import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/auth';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaUser, FaUserTie } from 'react-icons/fa';
import Navbar from '../HomePage/Navbar';
import Footer from '../HomePage/Footer';
import Swal from 'sweetalert2';
import '../../components/Library/Dashboard.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'client' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const usersPerPage = 6;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      const filteredUsers = (response.data.data || []).filter(user => user.role !== 'admin');
      setUsers(filteredUsers);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (filter === 'all') {
      return users;
    }
    return users.filter(user => user.role === filter);
  }, [filter, users]);

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / usersPerPage);
  useEffect(() => { setCurrentPage(1); }, [filter]);

  const openModal = (user = null) => {
    if (user) {
      setForm({ name: user.name, email: user.email, password: '', password_confirmation: '', role: user.role });
      setEditId(user.id);
    } else {
      setForm({ name: '', email: '', password: '', password_confirmation: '', role: 'client' });
      setEditId(null);
    }
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormError('');
  };
  
  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    
    if (!form.name || !form.email) {
        setFormError("Name and email are required.");
        setSubmitting(false);
        return;
    }
    if (!editId && !form.password) {
        setFormError("Password is required for new users.");
        setSubmitting(false);
        return;
    }
    if (form.password && form.password !== form.password_confirmation) {
        setFormError("Passwords do not match.");
        setSubmitting(false);
        return;
    }

    const payload = { ...form };
    if (editId && !payload.password) {
      delete payload.password;
      delete payload.password_confirmation;
    }

    try {
      if (editId) {
        await api.put(`/users/${editId}`, payload);
        Swal.fire('Success', 'User updated successfully!', 'success');
      } else {
        await api.post('/users', payload);
        Swal.fire('Success', 'User created successfully!', 'success');
      }
      fetchUsers();
      closeModal();
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        const errorMsg = Object.values(serverErrors).flat().join(' ');
        setFormError(errorMsg);
        Swal.fire('Error', errorMsg, 'error');
      } else {
        const responseError = error.response?.data?.message || 'An unexpected error occurred.';
        setFormError(responseError);
        Swal.fire('Error', responseError, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async (id) => {
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
      try {
        await api.delete(`/users/${id}`);
        await fetchUsers();
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to delete user.', 'error');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontWeight: 700, color: '#1e293b' }}>Manage Users</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', background: '#eef2f6', borderRadius: 8, padding: 4 }}>
              <button onClick={() => setFilter('all')} style={{ background: filter === 'all' ? '#fff' : 'transparent', color: '#333', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 600 }}>All Users</button>
              <button onClick={() => setFilter('client')} style={{ background: filter === 'client' ? '#fff' : 'transparent', color: '#333', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 600 }}>Clients</button>
              <button onClick={() => setFilter('owner')} style={{ background: filter === 'owner' ? '#fff' : 'transparent', color: '#333', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 600 }}>Owners</button>
            </div>
            <button className="btn-add-new" onClick={() => openModal()} style={{ background: '#3b82f6', color: 'white', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600, border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaPlus /> Add New User
            </button>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: '2rem' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No users found for this filter.</td></tr>
              )}
              {currentUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem' }}>{user.id}</td>
                  <td style={{ padding: '0.75rem' }}>{user.name}</td>
                  <td style={{ padding: '0.75rem' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ background: user.role === 'owner' ? '#ffedd5' : '#e0f2fe', color: user.role === 'owner' ? '#9a3412' : '#0c4a6e', padding: '0.25rem 0.6rem', borderRadius: 12, fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {user.role === 'owner' ? <FaUserTie /> : <FaUser />}
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button className="btn-edit" onClick={() => openModal(user)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 6, padding: '0.4rem 0.7rem', marginRight: 8 }}><FaEdit /></button>
                    <button className="btn-delete" onClick={() => handleDelete(user.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '0.4rem 0.7rem' }}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 8 }}>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #d1d5db', background: currentPage === 1 ? '#f3f4f6' : 'white', color: '#222', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>{'<'}</button>
              {[...Array(totalPages)].map((_, idx) => (
                <button key={idx + 1} onClick={() => setCurrentPage(idx + 1)} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #d1d5db', background: currentPage === idx + 1 ? '#3b82f6' : 'white', color: currentPage === idx + 1 ? 'white' : '#222', fontWeight: currentPage === idx + 1 ? 700 : 500 }}>{idx + 1}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #d1d5db', background: currentPage === totalPages ? '#f3f4f6' : 'white', color: '#222', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>{'>'}</button>
            </div>
          )}
        </div>
      </div>
      {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: 12, padding: '2rem', minWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', position: 'relative' }}>
              <button onClick={closeModal} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#888', fontSize: 20, cursor: 'pointer' }}><FaTimes /></button>
              <h2 style={{ marginBottom: 20, color: '#1e293b', fontWeight: 700 }}>{editId ? 'Edit User' : 'Create User'}</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 600 }}>Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleFormChange} style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 16 }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 600 }}>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleFormChange} style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 16 }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 600 }}>Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleFormChange} style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 16 }} placeholder={editId ? "Leave blank to keep current" : ""}/>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 600 }}>Confirm Password</label>
                  <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleFormChange} style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 16 }} placeholder="Confirm new password" />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 600 }}>Role</label>
                  <select name="role" value={form.role} onChange={handleFormChange} style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 16 }}>
                    <option value="client">Client</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                {formError && <div style={{ color: '#ef4444', marginBottom: 10, background: '#fee2e2', padding: '0.5rem', borderRadius: 6, border: '1px solid #fca5a5' }}>{formError}</div>}
                <button type="submit" disabled={submitting} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: 16, width: '100%' }}>
                  {submitting ? 'Saving...' : (editId ? 'Save Changes' : 'Create User')}
                </button>
              </form>
            </div>
          </div>
        )}
      <Footer />
    </>
  );
};

export default UserList;