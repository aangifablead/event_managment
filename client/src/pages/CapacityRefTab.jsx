import React, { useState, useEffect } from "react";
import useApi from "../hooks/useApi";

const CapacityRefTab = () => {
  const { execute, loading } = useApi();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await execute("/events");
      if (data) setEvents(data);
    };
    fetchEvents();
  }, [execute]);

  const getStatusConfig = (event) => {
    const total = event.capacity || 0;
    const booked = event.bookedCount || 0;
    const remaining = total - booked;
    const ratio = total > 0 ? booked / total : 0;
    const progress = Math.round(ratio * 100);

    // 1. SOLD OUT - Grey (100% full)
    if (remaining <= 0) {
      return { 
        label: "SOLD OUT", 
        bar: "bg-slate-300", 
        text: "text-slate-500", 
        bg: "bg-slate-100", 
        dot: "bg-slate-400", 
        progress: 100 
      };
    }

    // 2. CRITICAL - Red (90% sold / Only 10% left)
    // Works for 1000 (100 left) or 10 (1 left)
    if (ratio >= 0.9) {
      return { 
        label: "ALMOST FULL", 
        bar: "bg-rose-500", 
        text: "text-rose-600", 
        bg: "bg-rose-50", 
        dot: "bg-rose-500", 
        progress 
      };
    }

    // 3. WARNING - Yellow (50% to 89% sold)
    if (ratio >= 0.5) {
      return { 
        label: "FILLING FAST", 
        bar: "bg-amber-400", 
        text: "text-amber-600", 
        bg: "bg-amber-50", 
        dot: "bg-amber-500", 
        progress 
      };
    }

    // 4. AVAILABLE - Green (Less than 50% sold)
    return { 
      label: "AVAILABLE", 
      bar: "bg-emerald-400", 
      text: "text-emerald-600", 
      bg: "bg-emerald-50", 
      dot: "bg-emerald-500", 
      progress 
    };
  };

  if (loading && events.length === 0) {
    return <div className="p-10 text-center text-slate-400 font-bold">LOADING INVENTORY...</div>;
  }

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => {
          const status = getStatusConfig(event);
          const remaining = Math.max(0, event.capacity - event.bookedCount);

          return (
            <div 
              key={event._id} 
              className="p-7 border border-slate-100 rounded-[35px] bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Header: Matches image_95d95b.png layout */}
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                  {event.image ? (
                    <img src={event.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-indigo-50 text-indigo-200">🎵</div>
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h4 className="font-black text-slate-900 text-xl leading-tight truncate">{event.name}</h4>
                  <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase mt-1">
                    ₹{event.price?.toLocaleString('en-IN')} • {event.capacity} CAP
                  </p>
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-3 mb-6">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${status.bar}`}
                    style={{ width: `${status.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-tight">
                  <span className={status.text}>{status.progress}% booked</span>
                  <span className="text-slate-400">{remaining} left</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-4 py-2 rounded-full text-[11px] font-black tracking-widest flex items-center gap-2.5 w-fit ${status.bg} ${status.text}`}>
                <span className={`w-2 h-2 rounded-full ${status.dot} ${remaining > 0 ? 'animate-pulse' : ''}`}></span>
                {status.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CapacityRefTab;