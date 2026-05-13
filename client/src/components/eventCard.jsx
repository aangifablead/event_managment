import React from "react";
import { MapPin, CalendarDays } from "lucide-react";

const EventCard = ({ event }) => {
    const cleanPrice = Number(
        String(event?.price || 0).replace(/[^\d]/g, "")
    );

    return (
        /* Added h-full and flex-col to the main container */
        <div className="group bg-white border border-slate-200 rounded-[26px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">

            {/* IMAGE - Fixed height and aspect ratio */}
            <div className="relative h-48 flex-shrink-0 overflow-hidden">
                <img
                    src={event?.image || "../assets/concert.jpg"}
                    alt={event?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />

                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-md border border-white/60 text-slate-700 text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm">
                        {event?.category || "Music"}
                    </span>
                </div>

                <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-md border border-white/60 text-slate-700 text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                        Active
                    </span>
                </div>
            </div>

            {/* CONTENT - Added flex-1 to push the footer to the bottom */}
            <div className="p-4 flex flex-col flex-1">

                {/* DATE */}
                <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-2">
                    <CalendarDays size={13} />
                    <span>
                        {event?.date || "June 5, 2029"} •{" "}
                        {event?.time || "8:00 PM"}
                    </span>
                </div>

                {/* TITLE - Added min-h and h to keep vertical spacing consistent */}
                <h3 className="text-[20px] font-bold text-slate-900 leading-tight mb-3 line-clamp-2 h-[52px] group-hover:text-violet-700 transition-colors">
                    {event?.name || "Music Festival"}
                </h3>

                {/* LOCATION - flex-1 here ensures this area expands while keeping others aligned */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-5 flex-1">
                    <MapPin
                        size={14}
                        className="text-pink-500 flex-shrink-0"
                    />
                    <span className="truncate">
                        {event?.location}
                        {event?.city ? `, ${event.city}` : ''}
                    </span>
                </div>

                {/* FOOTER - mt-auto ensures this always stays at the very bottom */}
                <div className="flex items-center justify-between gap-4 mt-auto pt-2 border-t border-slate-50">

                    {/* PROGRESS */}
                    <div className="flex items-center gap-2 flex-1">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex-1">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-600"
                                style={{
                                    width: `${event?.progress || 65}%`,
                                }}
                            />
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 min-w-[34px]">
                            {event?.progress || 65}%
                        </span>
                    </div>

                    {/* PRICE */}
                    <div className="text-[24px] font-black text-pink-500 leading-none">
                        ₹{cleanPrice}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCard;