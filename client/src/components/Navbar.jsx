import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useSelector } from 'react-redux';

const Navbar = ({ activePage, toggleSidebar }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
console.log(user,'s9uidsadsadsa')
    return (
        <header className="p-4 lg:p-8 w-full">
            <div className="bg-white rounded-[24px] p-4 lg:p-5 flex items-center justify-between shadow-sm border border-slate-50">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Menu size={24} />
                    </button>

                    <div className="pl-2">
                        <h1 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight leading-tight">
                            {activePage}
                        </h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            {isAuthenticated ? `Welcome back, ${user?.fullName || user?.name}!` : "Welcome, Guest"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search Bar matching image_6480fc.png */}
                    {/* <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 gap-2">
                        <Search size={16} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="bg-transparent border-none outline-none text-sm text-slate-600 w-40"
                        />
                    </div> */}

                    <div className="flex items-center gap-3 ml-2">
                        <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">
                            {user?.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;