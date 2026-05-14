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
    const remaining = event.capacity - event.bookedCount;
    const progress = Math.round((event.bookedCount / event.capacity) * 100);

    if (remaining === 0) {
      return { label: "SOLD OUT", bar: "bg-gray-300", text: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400", progress };
    }
    if (remaining <= event.capacity * 0.1) {
      return { label: "ALMOST FULL", bar: "bg-rose-400", text: "text-rose-600", bg: "bg-rose-50", dot: "bg-rose-500", progress };
    }
    return { label: "AVAILABLE", bar: "bg-emerald-400", text: "text-emerald-600", bg: "bg-[#F0FDF4]", dot: "bg-emerald-500", progress };
  };

  if (loading && events.length === 0) {
    return <div className="p-10 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((event) => {
          const status = getStatusConfig(event);
          const remaining = event.capacity - event.bookedCount;

          return (
            <div key={event._id} className="p-5 border border-gray-100 rounded-[32px] bg-white shadow-sm hover:border-indigo-100 transition-all">
              {/* Header */}
              <div className="flex gap-4 mb-5">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                  {event.image ? (
                    <img src={event.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl bg-indigo-50 text-indigo-200">🎵</div>
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h4 className="font-bold text-gray-900 text-lg leading-tight truncate">{event.name}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-1">
                    ₹{event.price} · {event.capacity} CAP
                  </p>
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-2.5 mb-5">
                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${status.bar}`}
                    style={{ width: `${Math.max(status.progress, 2)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className={status.text}>{status.progress}% booked</span>
                  <span className="text-gray-400">{remaining} left</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider flex items-center gap-2 w-fit ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
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