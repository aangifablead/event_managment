import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter, addUserToStore, updateUserInStore, removeUserFromStore, setUsers } from '../features/userSlice';
import { Search, X, UserPlus, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, ChevronDown } from 'lucide-react';
import useApi from '../hooks/useApi';

const UserManagement = () => {
    const dispatch = useDispatch();
    const { execute, loading } = useApi();
    const recordsPerPage = 10;

    const { items = [], filter = "" } = useSelector((state) => state.users || {});

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'User' });
    const [currentPage, setCurrentPage] = useState(1);

    const authHeader = useMemo(() => {
        const activeToken = localStorage.getItem('token');
        return activeToken ? { 'Authorization': `Bearer ${activeToken}`, 'Content-Type': 'application/json' } : {};
    }, [showModal]);

    const fetchStaff = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const { data, error } = await execute('/staff', 'GET', null, authHeader);
        if (!error && data?.data) dispatch(setUsers(data.data));
    }, [execute, dispatch, authHeader]);

    const handleStatusChange = async (user, newStatus) => {
        const id = user._id || user.mongoId;
        const updatedData = { ...user, status: newStatus };
        const { data, error } = await execute(`/staff/${id}`, 'PUT', updatedData, authHeader);
        if (!error && data) dispatch(updateUserInStore(data));
    };

    const filteredUsers = useMemo(() => {
        return items.filter(user =>
            user.name?.toLowerCase().includes(filter.toLowerCase()) ||
            user.email?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [items, filter]);

    const currentTableData = filteredUsers.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
    const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const id = editingUser?._id || editingUser?.mongoId;
        const endpoint = editingUser ? `/staff/${id}` : '/staff';
        const method = editingUser ? 'PUT' : 'POST';
        const { data, error } = await execute(endpoint, method, formData, authHeader);
        if (!error && data) {
            editingUser ? dispatch(updateUserInStore(data)) : dispatch(addUserToStore(data));
            handleCloseModal();
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'User' });
    };

    const handleDelete = async (user) => {
        const id = user._id || user.mongoId;
        if (window.confirm("Are you sure?")) {
            const { error } = await execute(`/staff/${id}`, 'DELETE', null, authHeader);
            if (!error) dispatch(removeUserFromStore(id));
        }
    };

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-2">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E293B]">User Management</h1>
                    <p className="text-sm text-gray-400">Manage permissions and account statuses</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl outline-none text-sm bg-white shadow-sm focus:ring-1 focus:ring-pink-500/20 transition-all"
                            placeholder="Search users..."
                            value={filter}
                            onChange={(e) => { dispatch(setFilter(e.target.value)); setCurrentPage(1); }}
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#FF1F7D] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-pink-600 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                        <UserPlus size={18} /> Add User
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[550px] relative">
                {loading && !showModal && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#FF1F7D] animate-spin" />
                    </div>
                )}

                <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-10 py-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                                <th className="px-8 py-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Role</th>
                                <th className="px-8 py-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-10 py-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentTableData.map((user) => (
                                <tr key={user._id || user.mongoId} className="hover:bg-gray-50/40 transition-colors">
                                    <td className="px-10 py-5">
                                        <div className="text-[15px] font-bold text-slate-800">{user.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                                    </td>
                                    <td className="px-8 py-5 text-center text-[14px] text-slate-600 font-medium">{user.role}</td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="relative inline-flex items-center group">
                                            <select
                                                value={user.status || 'PENDING'}
                                                onChange={(e) => handleStatusChange(user, e.target.value)}
                                                className={`appearance-none pl-4 pr-10 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase cursor-pointer outline-none transition-all ${
                                                    user.status === 'CONFIRMED' 
                                                    ? 'bg-[#E6F9F1] text-[#059669]' 
                                                    : 'bg-[#FFF0F6] text-[#FF1F7D]'
                                                }`}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="CONFIRMED">Confirmed</option>
                                            </select>
                                            <ChevronDown size={12} className={`absolute right-3 pointer-events-none ${user.status === 'CONFIRMED' ? 'text-[#059669]' : 'text-[#FF1F7D]'}`} strokeWidth={3} />
                                        </div>
                                    </td>
                                    <td className="px-10 py-5 text-right">
                                        <div className="flex justify-end gap-3 text-gray-400">
                                            <button onClick={() => { setEditingUser(user); setFormData(user); setShowModal(true); }} className="hover:text-pink-500 transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(user)} className="hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-10 py-6 border-t border-gray-100 bg-white">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <div className="flex gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-30"><ChevronLeft size={16} /></button>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-30"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Status Dropdown Removed */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl relative">
                        <button onClick={handleCloseModal} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-black mb-8 text-slate-800">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Full Name</label>
                                <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-pink-500/10 transition-all" placeholder="Enter name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                                <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-pink-500/10 transition-all" type="email" placeholder="Enter email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Assign Role</label>
                                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-pink-500/10 transition-all" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4.5 bg-[#FF1F7D] text-white rounded-2xl font-bold shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all text-sm">
                                {loading ? 'Processing...' : (editingUser ? 'Update User' : 'Create User')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;