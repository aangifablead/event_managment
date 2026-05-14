import React from 'react';

const BookingEventCard = ({ event, isSelected, onSelect }) => {
    // Robust calculation to prevent NaN
    const capacity = Number(event.capacity) || 0;
    const booked = Number(event.bookedCount) || 0;
    const safeRemaining = Number(event.capacity || 0) - Number(event.bookedCount || 0);
    const displayRemaining = safeRemaining > 0 ? safeRemaining : 0;
    const progress = capacity > 0 ? Math.floor((booked / capacity) * 100) : 0;
    console.log(capacity, 'doduhsf', booked)
    const getStatus = () => {
        if (remaining === 0) return { label: "Sold out", color: "text-gray-500", bg: "bg-gray-100", bar: "bg-gray-400" };
        if (remaining <= capacity * 0.1) return { label: "Almost full", color: "text-red-700", bg: "bg-red-100", bar: "bg-red-500" };
        return { label: "Available", color: "text-green-700", bg: "bg-green-100", bar: "bg-green-500" };
    };

    const status = getStatus();

    return (
        <div
            onClick={() => remaining > 0 && onSelect(event)}
            className={`p-4 border rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-gray-100 hover:border-indigo-200 bg-white'
                }`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img src={event.image} alt="" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                    <div>
                        <h4 className="font-bold text-gray-800">{event.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">₹{event.price}/ticket · {capacity} capacity</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
                    {status.label}
                </span>
            </div>

            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-700 ${status.bar}`} style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-indigo-600">{progress}% booked</span>
                <span className="text-gray-400">{displayRemaining} tickets left</span>
            </div>
        </div>
    );
};
export default BookingEventCard;