import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, User, Mail, Smartphone, CreditCard, Banknote, Wallet, ChevronDown, Check, Minus, Plus, FileText, Music, AlertCircle } from "lucide-react";
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
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
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

  // Availability Logic for Dropdown
  const getAvailabilityStatus = (booked, capacity) => {
    const remaining = capacity - booked;
    const ratio = (remaining / capacity) * 100;
    if (remaining <= 0) return { label: "Sold Out", color: "bg-slate-400", bg: "bg-slate-100", text: "text-slate-500", isSoldOut: true };
    if (ratio <= 15) return { label: "Almost Full", color: "bg-rose-500", bg: "bg-rose-100", text: "text-rose-600", isSoldOut: false };
    if (ratio <= 40) return { label: "Filling Fast", color: "bg-amber-500", bg: "bg-amber-100", text: "text-amber-600", isSoldOut: false };
    return { label: "Available", color: "bg-emerald-500", bg: "bg-emerald-100", text: "text-emerald-600", isSoldOut: false };
  };

  const subtotal = useMemo(() => (selectedEvent ? selectedEvent.price * formData.tickets : 0), [selectedEvent, formData.tickets]);
  const fee = Math.round(subtotal * 0.03);
  const total = subtotal + fee;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedEvent) newErrors.event = "Please select an event";
    if (!formData.customerName.trim()) newErrors.customerName = "Customer name is required";
    else if (formData.customerName.trim().length < 3) newErrors.customerName = "Minimum 3 characters required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = "Enter valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateTickets = (value) => {
    const available = selectedEvent ? selectedEvent.capacity - selectedEvent.bookedCount : 999;
    setFormData((p) => ({ ...p, tickets: Math.max(1, Math.min(available, p.tickets + value)) }));
  };

  const handleConfirmBooking = async () => {
    if (!validate()) return;
    try {
      const payload = { ...formData, eventId: selectedEvent._id };
      const result = await execute("/bookings", "POST", payload);
      alert(`Booking Successful! ID: ${result?.booking?.bookingId}`);
      setFormData({ customerName: "", email: "", tickets: 1, paymentMode: "Online / UPI" });
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      alert(error?.message || "Booking failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* FORM SECTION */}
        <div className="xl:col-span-7">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 lg:p-10 shadow-sm">
            <h1 className="text-3xl font-black text-slate-800 mb-10">Create Booking</h1>

            <div className="space-y-8">
              {/* UPDATED DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 mb-3 tracking-widest">
                  <Calendar size={14} className="text-indigo-600" /> Select Event
                </label>
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 cursor-pointer flex items-center justify-between transition-all ${errors.event ? "border-red-300" : "border-slate-200 hover:border-indigo-300"}`}
                >
                  {selectedEvent ? (
                    <div className="flex items-center gap-4">
                      <img src={selectedEvent.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                      <div>
                        <h3 className="font-bold text-slate-800">{selectedEvent.name}</h3>
                        <p className="text-xs text-slate-500">₹{selectedEvent.price.toLocaleString()} per ticket</p>
                      </div>
                    </div>
                  ) : <span className="text-slate-400">Choose an event...</span>}
                  <ChevronDown size={20} className={`transition-transform text-slate-400 ${showDropdown ? "rotate-180" : ""}`} />
                </div>

                {showDropdown && (
                  <div className="absolute z-50 mt-3 w-full bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-2">
                    <div className="max-h-80 overflow-y-auto space-y-1">
                      {events.map((event) => {
                        const status = getAvailabilityStatus(event.bookedCount, event.capacity);
                        const fillPercent = (event.bookedCount / event.capacity) * 100;
                        return (
                          <div
                            key={event._id}
                            onClick={() => {
                              if (!status.isSoldOut) {
                                setSelectedEvent(event);
                                setShowDropdown(false);
                                setErrors(p => ({...p, event: ""}));
                              }
                            }}
                            className={`p-4 rounded-2xl transition-all ${status.isSoldOut ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:bg-indigo-50 cursor-pointer"}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-3">
                                <img src={event.image} className={`w-12 h-12 rounded-xl object-cover ${status.isSoldOut ? "grayscale" : ""}`} alt="" />
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm">{event.name}</h4>
                                  <p className="text-[11px] text-slate-500">{event.date} • ₹{event.price.toLocaleString()}</p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-700 ${status.color}`} style={{ width: `${fillPercent}%` }} />
                            </div>
                            <div className="flex justify-between mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              <span>{event.bookedCount} / {event.capacity} Booked</span>
                              <span>{event.capacity - event.bookedCount} Left</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {errors.event && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/>{errors.event}</p>}
              </div>

              {/* CUSTOMER INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleChange("customerName", e.target.value)}
                    placeholder="Enter full name"
                    className={`w-full px-5 py-4 rounded-2xl border-2 bg-slate-50 outline-none transition-all ${errors.customerName ? "border-red-200" : "border-slate-100 focus:border-indigo-400 focus:bg-white"}`}
                  />
                  {errors.customerName && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/>{errors.customerName}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@example.com"
                    className={`w-full px-5 py-4 rounded-2xl border-2 bg-slate-50 outline-none transition-all ${errors.email ? "border-red-200" : "border-slate-100 focus:border-indigo-400 focus:bg-white"}`}
                  />
                  {errors.email && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/>{errors.email}</p>}
                </div>
              </div>

              {/* TICKET SELECTOR */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-4">Number of Tickets</label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
                    <button onClick={() => updateTickets(-1)} className="w-11 h-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-all"><Minus size={16}/></button>
                    <span className="text-2xl font-black w-8 text-center">{formData.tickets}</span>
                    <button onClick={() => updateTickets(1)} className="w-11 h-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-all"><Plus size={16}/></button>
                  </div>
                  <span className="text-sm font-semibold text-slate-400">
                    {selectedEvent ? `${selectedEvent.capacity - selectedEvent.bookedCount} available` : "Select event first"}
                  </span>
                </div>
              </div>

              {/* PAYMENT MODE */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 mb-5 tracking-widest">
                  <CreditCard size={14} className="text-indigo-600" /> Payment Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentModes.map((mode) => (
                    <div
                      key={mode.id}
                      onClick={() => handleChange("paymentMode", mode.id)}
                      className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.paymentMode === mode.id ? "border-indigo-500 bg-indigo-50 shadow-md" : "border-slate-200 bg-white hover:border-slate-300"}`}
                    >
                      <div className="flex gap-4">
                        <div className={`p-3 rounded-2xl ${formData.paymentMode === mode.id ? "bg-white text-indigo-700" : "bg-slate-100 text-slate-500"}`}>{mode.icon}</div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{mode.id}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{mode.sub}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentMode === mode.id ? "border-indigo-600" : "border-slate-300"}`}>
                        {formData.paymentMode === mode.id && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY SECTION */}
        <div className="xl:col-span-5">
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 sticky top-6 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center"><FileText size={22} className="text-indigo-700" /></div>
              <h2 className="text-xl font-black text-slate-800">Booking Summary</h2>
            </div>

            {selectedEvent ? (
              <>
                <div className="rounded-3xl overflow-hidden border border-slate-100 mb-8">
                  <img src={selectedEvent.image} className="w-full h-48 object-cover" alt="" />
                  <div className="p-5 bg-slate-50/50">
                    <h3 className="font-black text-slate-800 text-lg">{selectedEvent.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{selectedEvent.date}</p>
                  </div>
                </div>

                <div className="space-y-4 border-b border-dashed border-slate-200 pb-7 mb-7">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Tickets</span><span className="font-bold">₹{selectedEvent.price.toLocaleString()} × {formData.tickets}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Platform Fee (3%)</span><span className="font-bold">₹{fee.toLocaleString()}</span></div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-sm text-slate-500">Total Amount</span>
                    <span className="text-3xl font-black text-indigo-700">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-3 ${loading ? "bg-indigo-300" : "bg-[#2D2D6E] hover:bg-indigo-900 active:scale-95"}`}
                >
                  {loading ? "Processing..." : <><Check size={20}/> Confirm Booking</>}
                </button>
              </>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50">
                <Music size={40} className="mx-auto mb-4 text-slate-200"/>
                <p className="text-sm font-bold text-slate-400">Select an event to see pricing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBookingTab;