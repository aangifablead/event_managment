import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/authSlice';
import useApi from '../hooks/useApi';
import { loadUserSpecificData } from '../features/userSlice';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { execute, loading, error: apiError } = useApi();
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const method = 'POST';
    const { data, error } = await execute(endpoint, method, formData);
    if (error) {
      return;
    }
    if (data) {
      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(data.user));
        dispatch(loginUser(data.user));
        dispatch(loadUserSpecificData());
        navigate('/');
      } else {
        alert("Account created! Please login.");
        setIsLogin(true);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* HEADER & SEARCH AREA */}
        <div className="flex flex-col sm:row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">User Management</h1>
            <p className="text-sm text-gray-500">Manage permissions and account statuses</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              {/* Professional Search Icon */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={filter}
                onChange={(e) => dispatch(setFilter(e.target.value))}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-pink-500 outline-none text-sm transition-all"
              />
            </div>
            <button
              onClick={handleOpenAddModal}
              className="bg-[#FF1F7D] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-pink-600 active:scale-95 transition-all whitespace-nowrap text-sm flex items-center gap-2"
            >
              <span className="text-lg">+</span> Add User
            </button>
          </div>
        </div>

        {/* ADD/EDIT INLINE FORM (The "Create New Account" section from your image) */}
        {showAddModal && (
          <div className="mb-8 p-6 bg-white rounded-[2rem] border border-pink-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {editingUser ? 'Edit User Account' : 'Create New Account'}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Full Name</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
              </div>
              <div className="w-40">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Organizer">Organizer</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-[#111827] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all text-sm">
                  Save
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">
                  Cancel
                </button>
              </div>
            </form>
            {error && <p className="text-red-500 text-xs font-bold mt-3 px-1">{error}</p>}
          </div>
        )}

        {/* MAIN TABLE CARD */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden h-fit transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/30">
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">User Info</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Role</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-8 py-5">
                        <div className="font-semibold text-gray-800 text-sm">{user.fullName}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-sm text-gray-600 font-medium">{user.role}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="bg-pink-50 text-[#FF1F7D] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
                          {user.status || 'Confirmed'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="text-[#FF1F7D] hover:text-pink-700 font-bold text-xs mr-4 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => dispatch(removeUserFromStore(user._id))}
                          className="text-gray-300 hover:text-red-500 font-bold text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-medium">
                      <div className="flex flex-col items-center opacity-40">
                        <Search size={40} className="mb-2" />
                        <p>No users found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER - Sticks to the bottom of the table content */}
          <div className="px-8 py-5 flex justify-between items-center border-t border-gray-50 bg-white">
            <p className="text-xs text-gray-400 font-medium">
              Showing <span className="text-gray-600">{filteredUsers.length}</span> Users
            </p>
            <div className="flex gap-2">
              <button className="px-5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
                Back
              </button>
              <button className="px-5 py-2 bg-[#FF1F7D] text-white rounded-xl text-xs font-bold shadow-md hover:bg-pink-600 active:scale-95 transition-all">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;