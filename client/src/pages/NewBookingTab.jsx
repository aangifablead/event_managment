import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Smartphone, CreditCard, Banknote, Wallet, ChevronDown, Check, Minus, Plus, FileText, Music, AlertCircle, PartyPopper } from "lucide-react";
import useApi from "../hooks/useApi";

// --- SUCCESS MODAL COMPONENT (Matches image_23cc45.png) ---
const SuccessModal = ({ isOpen, onClose, bookingDetails }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl text-center border border-slate-100 scale-in-center animate-in zoom-in-95 duration-200">
        <div className="w-24 h-24 bg-[#D1FAE5] text-[#059669] rounded-full flex items-center justify-center mx-auto mb-8">
          <PartyPopper size={44} />
        </div>
        
        <h2 className="text-[28px] font-black text-[#1E293B] mb-3">Booking Confirmed!</h2>
        <p className="text-[#64748B] text-lg mb-10 leading-relaxed">
          Your tickets have been reserved successfully.
        </p>
        
        <div className="bg-[#F8FAFC] rounded-[24px] p-6 mb-10 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-[1px]">Booking ID</span>
            <span className="font-bold text-[#6366F1]">#{bookingDetails?.bookingId || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-[1px]">Customer</span>
            <span className="font-bold text-[#1E293B]">{bookingDetails?.customerName || "Guest"}</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-[20px] font-bold text-lg transition-all active:scale-[0.98]"
        >
          Great, thanks!
        </button>
      </div>
    </div>
  );
};

const NewBookingTab = () => {
  const { execute, loading } = useApi();
  const dropdownRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

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
      const today = new Date().setHours(0, 0, 0, 0);
      const activeEvents = Array.isArray(eventsList) 
        ? eventsList.filter(e => new Date(e.date) >= today) 
        : [];
      setEvents(activeEvents);
    } catch (error) {
      console.error("Event fetch failed:", error);
    }
  };

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
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = "Enter valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleConfirmBooking = async () => {
    if (!validate()) return;
    try {
      const payload = { ...formData, eventId: selectedEvent._id };
      const result = await execute("/bookings", "POST", payload);
      
      // Based on your console image (image_23b5de.png):
      // The path is result -> data -> booking -> bookingId
      const actualBookingData = result?.data?.booking;

      setConfirmedBooking({
        bookingId: actualBookingData?.bookingId || "N/A", // Correct path
        customerName: actualBookingData?.customerName || formData.customerName
      });
      
      setShowSuccessModal(true);

      // Reset form fields
      setFormData({ customerName: "", email: "", tickets: 1, paymentMode: "Online / UPI" });
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("Booking failed", error);
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 lg:p-8">
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        bookingDetails={confirmedBooking}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side: Form */}
        <div className="xl:col-span-7">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 lg:p-10 shadow-sm">
            <h1 className="text-3xl font-black text-slate-800 mb-10">Create Booking</h1>

            <div className="space-y-8">
              {/* Event Dropdown */}
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
                        <p className="text-xs text-slate-500">₹{selectedEvent.price.toLocaleString()}</p>
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
                        return (
                          <div
                            key={event._id}
                            onClick={() => { if(!status.isSoldOut) { setSelectedEvent(event); setShowDropdown(false); } }}
                            className={`p-4 rounded-2xl transition-all ${status.isSoldOut ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:bg-indigo-50 cursor-pointer"}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3">
                                <img src={event.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm">{event.name}</h4>
                                  <p className="text-[10px] text-slate-500">{event.date}</p>
                                </div>
                              </div>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleChange("customerName", e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 bg-slate-50 border-slate-100 focus:border-indigo-400 outline-none transition-all"
                    placeholder="e.g. Alex"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 bg-slate-50 border-slate-100 focus:border-indigo-400 outline-none transition-all"
                    placeholder="alex@example.com"
                  />
                </div>
              </div>

              {/* Tickets */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-4">Tickets</label>
                <div className="flex items-center gap-4 bg-white border border-slate-200 p-2 w-fit rounded-2xl">
                  <button onClick={() => handleChange("tickets", Math.max(1, formData.tickets - 1))} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-all"><Minus size={16}/></button>
                  <span className="text-xl font-black w-8 text-center">{formData.tickets}</span>
                  <button onClick={() => handleChange("tickets", formData.tickets + 1)} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-all"><Plus size={16}/></button>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentModes.map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => handleChange("paymentMode", mode.id)}
                    className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.paymentMode === mode.id ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-slate-200"}`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="text-slate-400">{mode.icon}</div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{mode.id}</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{mode.sub}</p>
                      </div>
                    </div>
                    {formData.paymentMode === mode.id && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Summary */}
        <div className="xl:col-span-5">
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 sticky top-6 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center"><FileText size={22} className="text-indigo-700" /></div>
              <h2 className="text-xl font-black text-slate-800">Summary</h2>
            </div>

            {selectedEvent ? (
              <div className="space-y-6">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-bold">₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm border-b border-dashed border-slate-200 pb-4"><span className="text-slate-500">Fee</span><span className="font-bold">₹{fee.toLocaleString()}</span></div>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-slate-500">Total</span>
                  <span className="text-3xl font-black text-indigo-700">₹{total.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="w-full py-5 rounded-2xl font-bold text-white bg-[#0F172A] hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : <><Check size={20}/> Confirm Booking</>}
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <Music size={40} className="mx-auto mb-4 opacity-20"/>
                <p className="text-sm font-bold">Select an event</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBookingTab;