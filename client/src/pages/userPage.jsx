import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {setFilter,addUserToStore,updateUserInStore,removeUserFromStore,setUsers} from '../features/userSlice';
import { Search, X, UserPlus, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import useApi from '../hooks/useApi';

const UserManagement = () => {
    const dispatch = useDispatch();
    const { execute, loading } = useApi();
    const recordsPerPage = 10;

    // Redux State
    const { items = [], filter = "" } = useSelector((state) => state.users || {});

    // Local State
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'User' });
    const [currentPage, setCurrentPage] = useState(1);

    const authHeader = useMemo(() => {
        const activeToken = localStorage.getItem('token');
        if (!activeToken) return {};
        return {
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json'
        };
    }, [showModal]); // Re-calculates when modal toggles (common trigger)

    const fetchStaff = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return; // Prevent API call if user is not logged in

        const { data, error } = await execute('/staff', 'GET', null, authHeader);
        if (!error && data?.data) {
            dispatch(setUsers(data.data));
        }
    }, [execute, dispatch, authHeader]);

    const filteredUsers = useMemo(() => {
        return items.filter(user =>
            user.name?.toLowerCase().includes(filter.toLowerCase()) ||
            user.email?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [items, filter]);

    const currentTableData = filteredUsers.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'User'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const id = editingUser?._id || editingUser?.mongoId;
        const endpoint = editingUser ? `/staff/${id}` : '/staff';
        const method = editingUser ? 'PUT' : 'POST';

        const { data, error } = await execute(endpoint, method, formData, authHeader);

        if (!error && data) {
            if (editingUser) {
                dispatch(updateUserInStore(data));
            } else {
                dispatch(addUserToStore(data));
            }
            handleCloseModal();
        } else {
            alert(error || "Action failed");
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
            if (!error) {
                dispatch(removeUserFromStore(id));
            }
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

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
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none text-sm shadow-sm"
                            placeholder="Search users..."
                            value={filter}
                            onChange={(e) => { dispatch(setFilter(e.target.value)); setCurrentPage(1); }}
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#FF1F7D] text-white px-5 py-2 rounded-xl font-bold hover:bg-pink-600 transition-all text-sm flex items-center justify-center gap-2 shadow-md"
                    >
                        <UserPlus size={18} /> Add User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[550px] relative">
                {loading && !showModal && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#FF1F7D] animate-spin" />
                    </div>
                )}

                <div className="flex-grow overflow-x-auto">
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
                                <tr key={user._id || user.mongoId} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="text-sm font-bold text-gray-800">{user.name}</div>
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
                                            <button onClick={() => handleEditClick(user)} className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(user)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-6 border-t border-gray-100 bg-white mt-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing {currentTableData.length} of {filteredUsers.length} Users
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 border border-gray-200 rounded-xl disabled:opacity-20 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1
                                        ? 'bg-[#FF1F7D] text-white shadow-md'
                                        : 'text-gray-400 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 border border-gray-200 rounded-xl disabled:opacity-20 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative">
                        <button onClick={handleCloseModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-6 text-gray-900">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block tracking-widest">Full Name</label>
                                <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-pink-500/20" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block tracking-widest">Email Address</label>
                                <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-pink-500/20" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block tracking-widest">Role</label>
                                <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-pink-500/20" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4 bg-[#FF1F7D] text-white rounded-2xl font-bold shadow-lg mt-2 active:scale-[0.98] transition-transform">
                                {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;