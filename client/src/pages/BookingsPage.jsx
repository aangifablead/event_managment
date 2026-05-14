import React, { useState } from "react";
import { PlusCircle, LayoutList, Layers3 } from "lucide-react";

import NewBookingTab from "./NewBookingTab";
import AllBookingsTab from "./AllBookingsTab";
import CapacityRefTab from "./CapacityRefTab";

const BookingsDashboard = () => {
  const [activeTab, setActiveTab] = useState("new");

  const tabs = [
    {
      id: "new",
      label: "New Booking",
      icon: <PlusCircle size={17} />,
    },
    {
      id: "all",
      label: "All Bookings",
      icon: <LayoutList size={17} />,
    },
    {
      id: "ref",
      label: "Capacity States",
      icon: <Layers3 size={17} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-5 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Booking Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Manage bookings, events, and capacity status
          </p>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 md:px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                  active
                    ? "bg-[#2D2D6E] text-white border-[#2D2D6E] shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {activeTab === "new" && <NewBookingTab />}
          {activeTab === "all" && <AllBookingsTab />}
          {activeTab === "ref" && <CapacityRefTab />}
        </div>
      </div>
    </div>
  );
};

export default BookingsDashboard;