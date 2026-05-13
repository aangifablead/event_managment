import React from 'react';
import { LayoutDashboard, CalendarCheck, Ticket, Calendar, LogOut, Users, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';

const Sidebar = ({ setActivePage, isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const menuItems = [
    { name: 'Users', icon: <Users size={20} />, path: '/' }, // Matches image reference
    { name: 'Events', icon: <Ticket size={20} />, path: '/events' },
    { name: 'Bookings', icon: <CalendarCheck size={20} />, path: '/bookings' },
    { name: 'Calendar', icon: <Calendar size={20} />, path: '/calendar' },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleNavigation = (path, name) => {
    navigate(path);
    setActivePage(name);
    if (window.innerWidth < 1024) toggleSidebar();
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={toggleSidebar}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#2D2766] transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col shadow-2xl
      `}>
        {/* Brand Logo Area */}
        <div className="p-8 flex items-center gap-4">
          {/* Container for the logo - Removed mb-6 to fix alignment */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Zap className="text-white fill-white" size={24} />
          </div>

          {/* Brand Name - Using font-black and uppercase for maximum visibility */}
          <span className="font-black text-2xl text-white tracking-tighter uppercase">
            Ventixe
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-8">
          <div>
            <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path, item.name)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl mb-2 transition-all group relative ${isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1.5 h-6 bg-pink-500 rounded-r-full" />
                  )}
                  <span className={`${isActive ? 'text-pink-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Account Section */}
        <div className="p-4 mt-auto">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Account</p>
          <button
            className="w-full flex items-center gap-4 px-4 py-4 text-pink-400 hover:bg-pink-500/10 rounded-2xl transition-all border border-pink-500/20"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;