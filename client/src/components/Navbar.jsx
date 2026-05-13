import React from "react";
import { Menu } from "lucide-react";
import { useSelector } from "react-redux";

const Navbar = ({ activePage, toggleSidebar }) => {
  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  return (
    <header className="w-full px-5 pt-4 pb-2 bg-[#F8FAFC]">

      <div className="bg-white border border-slate-200 rounded-xl px-5 h-[82px] shadow-sm flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* MOBILE MENU */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600"
          >
            <Menu size={18} />
          </button>

          {/* TITLE */}
          <div>
            <h1 className="text-[20px] font-bold text-slate-900 leading-none">
              {activePage}
            </h1>

            <p className="text-[13px] text-slate-500 mt-1">
              {isAuthenticated
                ? `Welcome back, ${user?.fullName || user?.name}`
                : "Welcome back"}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* AVATAR */}
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() ||
              user?.fullName?.charAt(0)?.toUpperCase() ||
              "A"}
          </div>

          {/* USER INFO */}
          <div className="hidden md:block leading-tight">
            <h3 className="text-sm font-semibold text-slate-900">
              {user?.fullName || user?.name || "Admin"}
            </h3>

            <p className="text-xs text-slate-500">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;