import React from "react";
import { MapPin, CalendarDays } from "lucide-react";

const EventCard = ({ event }) => {
    // Format price and handle field name variations
    const cleanPrice = Number(
        String(event?.price || 0).replace(/[^\d]/g, "")
    );
    const title = event?.name || event?.title || "Music Festival";
    const eventLocation = event?.venue || event?.location;

    return (
        <div className="group bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col w-full max-w-[340px] mx-auto">
            {/* Image Section - Height reduced for better proportions */}
            <div className="relative h-44 flex-shrink-0 overflow-hidden">
                <img
                    src={event?.image || event?.coverImage || "/api/placeholder/400/320"}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges - Slightly smaller and higher padding */}
                <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-tight">
                        {event?.category || "Music"}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                        Active
                    </span>
                </div>
            </div>

            {/* Content Section - Tightened padding */}
            <div className="p-4 flex flex-col">
                {/* Date/Time */}
                <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
                    <CalendarDays size={14} />
                    <span>{event?.date} • {event?.time}</span>
                </div>

                {/* Title - Reduced margin and size for compact look */}
                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 line-clamp-1 group-hover:text-violet-700 transition-colors">
                    {title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-slate-500 mb-4">
                    <MapPin size={14} className="text-pink-500 flex-shrink-0" />
                    <span className="text-[13px] truncate font-medium">
                        {eventLocation}{event?.city ? `, ${event.city}` : ''}
                    </span>
                </div>

                {/* Footer - Unified Price Line */}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</span>
                    <div className="text-2xl font-black text-pink-500 tracking-tight">
                        ₹{cleanPrice.toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCard;