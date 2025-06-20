// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-white shadow-sm h-screen fixed">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/admin/categories"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg ${isActive ? 'bg-[#199A8E] text-white' : 'text-gray-700 hover:bg-gray-100'}`
                }
              >
                Categories
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;