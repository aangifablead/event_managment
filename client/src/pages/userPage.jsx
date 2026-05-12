import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {setFilter,addUserToStore,updateUserInStore,removeUserFromStore,loadUserSpecificData} from '../features/userSlice';
import { Search, X, UserPlus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const UserManagement = () => {

    const dispatch = useDispatch();
    const recordsPerPage = 10;
    
    const { items = [], filter = "" } = useSelector((state) => state.users || {});
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', email: '', role: 'User' });
    const [currentPage, setCurrentPage] = useState(1);

    
    const filteredUsers = useMemo(() => {
        return items.filter(user =>
            user.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
            user.email?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [items, filter]);
    
    const currentTableData = filteredUsers.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );
    const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            dispatch(updateUserInStore({ ...formData, _id: editingUser._id }));
        } else {
            dispatch(addUserToStore({ ...formData, _id: Date.now().toString(), status: 'Confirmed' }));
        }
        setShowModal(false);
    };
    
    useEffect(() => {
        dispatch(loadUserSpecificData());
    }, [dispatch]);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-500">Manage permissions and account statuses</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-sm transition-all shadow-sm"
                            placeholder="Search users..."
                            value={filter}
                            onChange={(e) => { dispatch(setFilter(e.target.value)); setCurrentPage(1); }}
                        />
                    </div>
                    <button
                        onClick={() => { setEditingUser(null); setFormData({ fullName: '', email: '', role: 'User' }); setShowModal(true); }}
                        className="bg-[#FF1F7D] text-white px-5 py-2 rounded-xl font-bold hover:bg-pink-600 transition-all text-sm flex items-center justify-center gap-2 shadow-md"
                    >
                        <UserPlus size={18} /> Add User
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTAINER --- */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Role</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentTableData.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="text-sm font-bold text-gray-800">{user.fullName}</div>
                                        <div className="text-xs text-gray-400">{user.email}</div>
                                    </td>
                                    <td className="px-8 py-4 text-center text-sm text-gray-600 font-medium">{user.role}</td>
                                    <td className="px-8 py-4 text-center">
                                        <span className="bg-pink-50 text-[#FF1F7D] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            {user.status || 'Confirmed'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setEditingUser(user); setFormData(user); setShowModal(true); }} className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => dispatch(removeUserFromStore(user._id))} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {currentTableData.map((user) => (
                        <div key={user._id} className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">{user.fullName}</h3>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <span className="bg-pink-50 text-[#FF1F7D] px-2 py-1 rounded-lg text-[9px] font-bold uppercase">
                                    {user.status || 'Confirmed'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs font-semibold text-gray-500">{user.role}</span>
                                <div className="flex gap-3">
                                    <button onClick={() => { setEditingUser(user); setFormData(user); setShowModal(true); }} className="text-sm font-bold text-[#FF1F7D]">Edit</button>
                                    <button onClick={() => dispatch(removeUserFromStore(user._id))} className="text-sm font-bold text-gray-300 hover:text-red-500">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Showing {filteredUsers.length > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0} to {Math.min(currentPage * recordsPerPage, filteredUsers.length)} of {filteredUsers.length} Users
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 border border-gray-200 rounded-xl disabled:opacity-20 hover:bg-gray-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[#FF1F7D] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 border border-gray-200 rounded-xl disabled:opacity-20 hover:bg-gray-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal remains unchanged for logic */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400"><X size={20} /></button>
                        <h2 className="text-xl font-bold mb-6">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                            <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm" placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm appearance-none" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select>
                            <button type="submit" className="w-full py-4 bg-[#FF1F7D] text-white rounded-2xl font-bold shadow-lg mt-2 transition-transform active:scale-95">
                                {editingUser ? 'Update Changes' : 'Create User'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;