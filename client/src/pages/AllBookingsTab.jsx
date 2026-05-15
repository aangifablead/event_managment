import React, { useEffect, useMemo, useState } from "react";
import { Search, Loader2, AlertCircle, CreditCard, Calendar } from "lucide-react";
import useApi from "../hooks/useApi";

const AllBookingsTab = () => {
  const { execute, loading, error } = useApi();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await execute("/bookings");
      const bookingsData = response?.data?.bookings || response?.data || [];
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const getBookingStatus = (paymentMode) => {
    if (paymentMode === "Cash") {
      return { label: "Pending", style: "bg-amber-100 text-amber-700 border-amber-200" };
    }
    return { label: "Confirmed", style: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  };

  const getEventStatus = (event) => {
    if (!event) return { label: "N/A", style: "bg-slate-100 text-slate-600" };
    
    const { bookedCount, capacity } = event;
    const ratio = bookedCount / capacity;

    if (bookedCount >= capacity) return { label: "Sold Out", style: "bg-slate-100 text-slate-500" };
    if (ratio >= 0.9) return { label: "Almost Full", style: "bg-red-100 text-red-700" };
    if (ratio >= 0.5) return { label: "Filling Fast", style: "bg-orange-100 text-orange-700" };
    return { label: "Available", style: "bg-green-100 text-green-700" };
  };

  // --- LOGIC END ---

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const value = search.toLowerCase();
      return (
        booking?.bookingId?.toLowerCase().includes(value) ||
        booking?.customerName?.toLowerCase().includes(value) ||
        booking?.event?.name?.toLowerCase().includes(value)
      );
    });
  }, [bookings, search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <Loader2 size={20} className="animate-spin" />
          Loading bookings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full max-w-md bg-white border border-red-200 rounded-2xl p-8 shadow-sm text-center">
          <AlertCircle size={42} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Failed to load bookings</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-5 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* PAGE HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              All Bookings
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              View and manage all event bookings
            </p>
          </div>

          <div className="relative w-full lg:w-[340px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search booking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
            />
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((row) => {
              const bStatus = getBookingStatus(row.paymentMode);
              const eStatus = getEventStatus(row.event);
              return (
                <div key={row._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                        {row.bookingId}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
                        <Calendar size={13} />
                        <span>
                          {new Date(row.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">
                        ₹{row.totalAmount?.toLocaleString()}
                      </p>
                      {/* Booking Status Badge (Pending/Confirmed) */}
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${bStatus.style}`}>
                        {bStatus.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="space-y-3">
                      <div className="flex justify-between gap-4">
                        <span className="text-xs font-medium text-slate-400 uppercase">Customer</span>
                        <span className="text-sm font-semibold text-slate-700 text-right">{row.customerName}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-xs font-medium text-slate-400 uppercase">Event</span>
                        <div className="text-right">
                            <span className="text-sm font-semibold text-slate-700 block">{row.event?.name || "---"}</span>
                            {/* Event Capacity Status Badge */}
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${eStatus.style}`}>
                                {eStatus.label}
                            </span>
                        </div>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-xs font-medium text-slate-400 uppercase">Tickets</span>
                        <span className="text-sm font-bold text-slate-900">{row.tickets}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-xs font-medium text-slate-400 uppercase">Payment</span>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase">
                          <CreditCard size={12} />
                          {row.paymentMode}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl py-14 text-center">
              <p className="text-slate-400 text-sm">No bookings found</p>
            </div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 lg:px-8 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Booking Records</h2>
              <p className="text-sm text-slate-500 mt-1">
                Total bookings: {filteredBookings.length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Booking ID", "Customer", "Event", "Tickets", "Amount", "Payment", "Booking Status", "Event Status"].map((header) => (
                    <th key={header} className="px-6 lg:px-8 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((row, index) => {
                    const bStatus = getBookingStatus(row.paymentMode);
                    const eStatus = getEventStatus(row.event);
                    return (
                      <tr key={row._id} className={`border-b border-slate-100 hover:bg-slate-50 transition-all ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                        <td className="px-6 lg:px-8 py-5 whitespace-nowrap">
                          <p className="font-bold text-sm text-slate-800 uppercase">{row.bookingId}</p>
                        </td>
                        <td className="px-6 lg:px-8 py-5 min-w-[220px]">
                          <div>
                            <p className="font-semibold text-slate-800">{row.customerName}</p>
                            <p className="text-xs text-slate-500 mt-1">{row.email}</p>
                          </div>
                        </td>
                        <td className="px-6 lg:px-8 py-5 min-w-[240px]">
                          <p className="text-sm font-medium text-slate-700">{row.event?.name || "---"}</p>
                        </td>
                        <td className="px-6 lg:px-8 py-5">
                          <p className="font-bold text-slate-900">{row.tickets}</p>
                        </td>
                        <td className="px-6 lg:px-8 py-5 whitespace-nowrap">
                          <p className="font-bold text-slate-900">₹{row.totalAmount?.toLocaleString()}</p>
                        </td>
                        <td className="px-6 lg:px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <CreditCard size={14} />
                            {row.paymentMode}
                          </div>
                        </td>
                        {/* Booking Status Column (Payment Driven) */}
                        <td className="px-6 lg:px-8 py-5">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border whitespace-nowrap ${bStatus.style}`}>
                            {bStatus.label}
                          </span>
                        </td>
                        {/* Event Status Column (Capacity Driven) */}
                        <td className="px-6 lg:px-8 py-5">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap ${eStatus.style}`}>
                            {eStatus.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-20 text-center">
                      <p className="text-slate-400 text-sm">No records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllBookingsTab;