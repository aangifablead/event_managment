import React, { useEffect, useState } from "react";
import { Menu, Bell, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { addNotification, markAllAsRead } from "../features/notificationSlice"

const socket = io("http://localhost:5000");

const Navbar = ({ activePage, toggleSidebar }) => {
  const dispatch = useDispatch();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items, unreadCount } = useSelector((state) => state.notifications);

// Navbar.js useEffect
useEffect(() => {
    if (user) {
        const userId = user.mongoId || user._id;
        console.log("Connecting user to rooms:", userId);
        socket.emit("join", { 
            userId: userId, 
            role: user.role || 'Administrator' 
        });

        socket.on("new-notification", (data) => {
            console.log("Notification received:", data);
            dispatch(addNotification(data));
        });
    }
    return () => socket.off("new-notification");
}, [user, dispatch]);

  return (
    <header className="w-full px-5 pt-4 pb-2 bg-[#F8FAFC]">
      <div className="bg-white border border-slate-200 rounded-xl px-5 h-[82px] shadow-sm flex items-center justify-between">
        
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600">
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-[20px] font-bold text-slate-900 leading-none">{activePage}</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {isAuthenticated ? `Welcome back, ${user?.fullName || user?.name}` : "Welcome back"}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          
          {/* NOTIFICATION BELL */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) dispatch(markAllAsRead());
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* DROPDOWN */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                  <button onClick={() => setShowNotifications(false)}><X size={14}/></button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="p-8 text-center text-slate-400 text-sm">No new notifications</p>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <p className="text-sm text-slate-800 font-medium">{item.message}</p>
                        <span className="text-[11px] text-slate-400 mt-1 block">Just now</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AVATAR & INFO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">
              {(user?.name || user?.fullName || "A").charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block leading-tight">
              <h3 className="text-sm font-semibold text-slate-900">{user?.fullName || user?.name || "Admin"}</h3>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;