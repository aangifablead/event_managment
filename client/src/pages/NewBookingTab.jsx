import React, { useEffect, useMemo, useRef, useState } from "react";
import {Calendar,User,Mail,Smartphone,CreditCard,Banknote,Wallet,ChevronDown,Check,Minus,Plus,FileText,Music,AlertCircle,}from "lucide-react";

import useApi from "../hooks/useApi";

const NewBookingTab = () => {
  const { execute, loading } = useApi();
  const dropdownRef = useRef(null);


  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    tickets: 1,
    paymentMode: "Online / UPI",
  });
  const [errors, setErrors] = useState({});

  const paymentModes = [
    { id: "Online / UPI", sub: "Instant confirmation", icon: <Smartphone size={20} /> },
    { id: "Debit / Credit", sub: "Visa, Mastercard", icon: <CreditCard size={20} /> },
    { id: "Cash", sub: "Pay at venue", icon: <Banknote size={20} /> },
    { id: "Wallet", sub: "Paytm, PhonePe", icon: <Wallet size={20} /> },
  ];


  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await execute("/events");
      const eventsList = response?.data?.events || response?.data || [];
      setEvents(Array.isArray(eventsList) ? eventsList : []);
    } catch (error) {
      console.error("Event fetch failed:", error);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const subtotal = useMemo(() => {
    if (!selectedEvent) return 0;
    return selectedEvent.price * formData.tickets;
  }, [selectedEvent, formData.tickets]);

  const fee = Math.round(subtotal * 0.03);
  const total = subtotal + fee;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedEvent) newErrors.event = "Please select an event";
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    } else if (formData.customerName.trim().length < 3) {
      newErrors.customerName = "Minimum 3 characters required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Enter valid email address";
    }
    if (formData.tickets < 1) newErrors.tickets = "Minimum 1 ticket required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateTickets = (value) => {
    const availableTickets = selectedEvent ? selectedEvent.capacity - selectedEvent.bookedCount : 9999;
    const newValue = Math.max(1, Math.min(availableTickets, formData.tickets + value));
    setFormData((prev) => ({ ...prev, tickets: newValue }));
  };

  const handleConfirmBooking = async () => {
    if (!validate()) return;
    const payload = {
      eventId: selectedEvent._id,
      customerName: formData.customerName.trim(),
      email: formData.email.trim(),
      tickets: formData.tickets,
      paymentMode: formData.paymentMode,
    };

    try {
      const result = await execute("/bookings", "POST", payload);
      alert(`Booking Successful! Booking ID: ${result?.booking?.bookingId || "N/A"}`);
      setFormData({ customerName: "", email: "", tickets: 1, paymentMode: "Online / UPI" });
      setSelectedEvent(null);
      setShowDropdown(false);
      fetchEvents();
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || "Booking failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* LEFT SIDE: FORM */}
          <div className="xl:col-span-7">
            <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm p-5 sm:p-8 lg:p-10">
              <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create Booking</h1>
                <p className="text-slate-500 mt-2 text-sm">Fill all required details to create a new booking.</p>
              </div>

              <div className="space-y-8">
                {/* EVENT SELECT */}
                <div className="relative" ref={dropdownRef}>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                    <Calendar size={14} className="text-indigo-600" /> Select Event
                  </label>
                  <div
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 cursor-pointer transition-all flex items-center justify-between ${
                      errors.event ? "border-red-300" : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {selectedEvent ? (
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={selectedEvent.image || "https://via.placeholder.com/150"}
                          alt={selectedEvent.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 truncate">{selectedEvent.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">₹{selectedEvent.price?.toLocaleString()} per ticket</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 font-medium">Choose an event...</p>
                    )}
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                  </div>

                  {errors.event && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.event}
                    </p>
                  )}

                  {showDropdown && (
                    <div className="absolute z-50 mt-3 w-full bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
                      <div className="max-h-80 overflow-y-auto p-2">
                        {events.length > 0 ? (
                          events.map((event) => (
                            <div
                              key={event._id}
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowDropdown(false);
                                setErrors((prev) => ({ ...prev, event: "" }));
                              }}
                              className="flex items-center justify-between gap-4 p-4 rounded-2xl hover:bg-indigo-50 cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <img
                                  src={event.image || "https://via.placeholder.com/150"}
                                  alt={event.name}
                                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                                />
                                <div className="min-w-0">
                                  <h3 className="font-bold text-slate-800 truncate">{event.name}</h3>
                                  <p className="text-xs text-slate-500 mt-1">{event.date} • {event.capacity - event.bookedCount} left</p>
                                </div>
                              </div>
                              <div className="font-black text-indigo-700">₹{event.price?.toLocaleString()}</div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400">No events found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* NAME & EMAIL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                      <User size={14} /> Customer Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={formData.customerName}
                      onChange={(e) => handleChange("customerName", e.target.value)}
                      className={`w-full px-5 py-4 rounded-2xl border-2 bg-slate-50 outline-none transition-all ${
                        errors.customerName ? "border-red-300" : "border-slate-200 focus:border-indigo-400 focus:bg-white"
                      }`}
                    />
                    {errors.customerName && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.customerName}</p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                      <Mail size={14} /> Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`w-full px-5 py-4 rounded-2xl border-2 bg-slate-50 outline-none transition-all ${
                        errors.email ? "border-red-300" : "border-slate-200 focus:border-indigo-400 focus:bg-white"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.email}</p>
                    )}
                  </div>
                </div>

                {/* TICKETS */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Number Of Tickets</label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-4 border border-slate-200 rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <button onClick={() => updateTickets(-1)} className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-indigo-50 transition-all">
                        <Minus size={16} />
                      </button>
                      <span className="text-2xl font-black text-slate-800 min-w-[40px] text-center">{formData.tickets}</span>
                      <button onClick={() => updateTickets(1)} className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-indigo-50 transition-all">
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-slate-500">
                      {selectedEvent ? `${selectedEvent.capacity - selectedEvent.bookedCount} available` : "Select event first"}
                    </span>
                  </div>
                </div>

                {/* PAYMENT MODE */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-5">
                    <CreditCard size={14} className="text-indigo-600" /> Payment Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {paymentModes.map((mode) => (
                      <div
                        key={mode.id}
                        onClick={() => handleChange("paymentMode", mode.id)}
                        className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${
                          formData.paymentMode === mode.id ? "border-indigo-500 bg-indigo-50 shadow-md" : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl ${formData.paymentMode === mode.id ? "bg-white text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                            {mode.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-sm">{mode.id}</h3>
                            <p className="text-xs text-slate-500 mt-1">{mode.sub}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentMode === mode.id ? "border-indigo-600" : "border-slate-300"}`}>
                            {formData.paymentMode === mode.id && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SUMMARY */}
          <div className="xl:col-span-5">
            <div className="sticky top-6">
              <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                    <FileText size={22} className="text-indigo-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Booking Summary</h2>
                    <p className="text-sm text-slate-500 mt-1">Review details before payment</p>
                  </div>
                </div>

                {selectedEvent ? (
                  <>
                    <div className="rounded-3xl overflow-hidden border border-slate-200 mb-8">
                      <img src={selectedEvent.image || "https://via.placeholder.com/600x300"} alt={selectedEvent.name} className="w-full h-52 object-cover" />
                      <div className="p-5">
                        <h3 className="font-black text-slate-800 text-lg">{selectedEvent.name}</h3>
                        <p className="text-sm text-slate-500 mt-2">{selectedEvent.date}</p>
                      </div>
                    </div>

                    <div className="space-y-5 border-b border-dashed border-slate-200 pb-7 mb-7 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Ticket Price</span>
                        <span className="font-bold text-slate-800">₹{selectedEvent.price?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Quantity</span>
                        <span className="font-bold text-slate-800">{formData.tickets}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-bold text-slate-800">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Platform Fee</span>
                        <span className="font-bold text-slate-800">₹{fee.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="text-sm text-slate-500">Total Amount</p>
                        <h2 className="text-3xl font-black text-indigo-700 mt-1">₹{total.toLocaleString()}</h2>
                      </div>
                      <div className="px-3 py-2 rounded-full bg-green-100 text-green-700 text-xs font-bold">Secure</div>
                    </div>

                    <button
                      onClick={handleConfirmBooking}
                      disabled={loading}
                      className={`w-full py-5 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-xl ${
                        loading ? "bg-indigo-400 cursor-not-allowed" : "bg-[#2D2D6E] hover:bg-indigo-900 active:scale-[0.99]"
                      }`}
                    >
                      {loading ? (
                        <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing...</>
                      ) : (
                        <><Check size={20} strokeWidth={3} /> Confirm Booking</>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50 py-20 px-6 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mx-auto shadow-sm mb-5">
                      <Music size={34} className="text-slate-300" />
                    </div>
                    <h3 className="font-black text-slate-700 text-lg">No Event Selected</h3>
                    <p className="text-sm text-slate-500 mt-3 max-w-xs mx-auto">Please select an event to view booking summary and pricing.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBookingTab;