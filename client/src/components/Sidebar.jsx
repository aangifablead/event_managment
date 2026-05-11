import React from 'react';
import { LayoutDashboard, CalendarCheck, Ticket, Calendar, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';  
import { logoutUser } from '../features/authSlice'; 

const Sidebar = ({ setActivePage, isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { name: 'Events', icon: <Ticket size={18} />, path: '/events' },
    { name: 'Bookings', icon: <CalendarCheck size={18} />, path: '/bookings' },
    { name: 'Calendar', icon: <Calendar size={18} />, path: '/calendar' },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.removeItem('user'); 
    navigate('/auth'); 
  };

  const handleNavigation = (path, name) => {
    navigate(path);
    setActivePage(name);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#F3F5FF] transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col border-r border-gray-100
      `}>
        <div className="p-6 font-bold text-xl text-slate-800">Ventixe</div>
        
        <nav className="flex-1 px-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path, item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all relative ${
                  isActive
                    ? 'bg-white text-pink-500 shadow-sm'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-pink-500 rounded-r-full" />
                )}
                <span className={`${isActive ? 'text-pink-500' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <button 
          className="flex items-center gap-3 px-4 py-6 text-slate-600 hover:text-red-500 transition-colors mt-4 border-t border-gray-100" 
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;