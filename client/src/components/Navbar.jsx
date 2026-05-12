import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ activePage, toggleSidebar }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/auth');
    };

    return (
        <header className="p-4 lg:p-6 w-full">
            <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600">
                        <Menu size={20} />
                    </button>

                    <div>
                        <h1 className="text-lg lg:text-xl font-bold text-slate-800">{activePage}</h1>
                        <p className="hidden sm:block text-[10px] text-slate-600 uppercase mt-0.5">
                            {isAuthenticated ? `Welcome back, ${user?.fullName || user?.name}!` : "Welcome, Guest"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                    <div className="flex items-center gap-3 border-l pl-4 lg:pl-6 border-slate-100">
                        {/* {isAuthenticated ? ( */}
                            {/* <> */}
                                <div className="hidden lg:block text-right">
                                    <p className="text-xs font-bold text-slate-800 leading-none">
                                        {user?.fullName || user?.name || "User"}
                                    </p>
                                </div>
                            {/* </> */}
                        {/* ) : (
                            <button
                                onClick={() => navigate('/auth')}
                                className="text-xs font-bold text-blue-500 hover:underline uppercase"
                            >
                                Login
                            </button>
                        )} */}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;