import React, { useMemo, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFilteredEvents, setFilters, setCurrentPage, setEvents } from "../features/eventSlice";
import EventCard from "../components/EventCard";
import AddEventModal from "../components/EventModal";
import { Search, ChevronDown } from "lucide-react";
import useApi from "../hooks/useApi";

const EventPage = () => {
    const dispatch = useDispatch();
    const { execute, loading } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const dropdownRef = useRef(null);

    const filteredEvents = useSelector(selectFilteredEvents);
    const { currentPage, itemsPerPage } = useSelector((state) => state.events.pagination);
    const { search, category } = useSelector((state) => state.events.filters);

    // 1. DATA REFRESH LOGIC: Fixes the 'undefined' issue in image_bd441a.png
    const fetchEvents = async () => {
        const { data } = await execute('/events', 'GET');
        if (data) {
            dispatch(setEvents(data));
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [execute, dispatch]);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsCategoryOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const { currentItems, totalPages, firstIdx, lastIdx } = useMemo(() => {
        const last = currentPage * itemsPerPage;
        const first = last - itemsPerPage;
        return {
            currentItems: filteredEvents.slice(first, last),
            totalPages: Math.ceil(filteredEvents.length / itemsPerPage),
            firstIdx: first,
            lastIdx: last,
        };
    }, [filteredEvents, currentPage, itemsPerPage]);

    const categories = ["All Categories", "Fashion", "Music", "Tech"];

    return (
        <div className="space-y-4">
            {/* Filter UI - Matches image_bd4b9d.png */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={search}
                            onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                            className="w-full h-11 pl-10 pr-4 border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-violet-500 text-sm transition-all"
                        />
                    </div>

                    {/* Custom Category Dropdown */}
                    <div className="relative min-w-[220px]" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="w-full h-11 px-4 flex items-center justify-between border border-[#E2E8F0] rounded-lg bg-white text-sm text-slate-700 hover:bg-slate-50 transition-all"
                        >
                            <span>{category}</span>
                            <ChevronDown size={16} className={`text-slate-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isCategoryOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            dispatch(setFilters({ category: cat }));
                                            setIsCategoryOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                            category === cat ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Create Button */}
                    <button 
                        onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }} 
                        className="h-11 px-6 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg text-white text-sm font-medium transition-all"
                    >
                        Create Event
                    </button>
                </div>
            </div>

            {/* Grid Area */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {currentItems.map((event) => (
                        <div 
                            key={event.id || event._id} 
                            onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }} 
                            className="cursor-pointer active:scale-[0.98] transition-transform"
                        >
                            <EventCard event={event} />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
                <p className="text-sm text-slate-500 font-medium">
                    Showing <span className="font-semibold text-slate-900">{firstIdx + 1}-{Math.min(lastIdx, filteredEvents.length)}</span> of <span className="font-semibold text-slate-900">{filteredEvents.length}</span>
                </p>
                <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => dispatch(setCurrentPage(i + 1))}
                            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                                currentPage === i + 1 ? "bg-violet-600 text-white shadow-md shadow-violet-100" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>

            <AddEventModal
                isOpen={isModalOpen}
                editingEvent={selectedEvent}
                onSuccess={fetchEvents} // 2. REFRESH TRIGGER: Ensures data from DB is loaded after save
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEvent(null);
                }} 
            />
        </div>
    );
};

export default EventPage;