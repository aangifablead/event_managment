import React, { useMemo, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFilteredEvents, setFilters, setCurrentPage, setEvents, addEvent } from "../features/eventSlice";
import EventCard from "../components/EventCard";
import AddEventModal from "../components/EventModal";
import { Search, ChevronDown, CalendarDays, Plus } from "lucide-react";
import useApi from "../hooks/useApi";

const EventPage = () => {
    const dispatch = useDispatch();
    const { execute, loading } = useApi();

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Redux State
    const allEvents = useSelector((state) => state.events.events);
    const filteredEvents = useSelector(selectFilteredEvents);
    const { currentPage, itemsPerPage } = useSelector((state) => state.events.pagination);
    const { search, category } = useSelector((state) => state.events.filters);

    // 1. Fetch Events from API
    const fetchEvents = async () => {
        const { data } = await execute('/events', 'GET');
        if (data) {
            // Note: If your GET /events returns { events: [...] }, use data.events
            const eventList = Array.isArray(data) ? data : data.events;
            dispatch(setEvents(eventList || []));
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // 2. Click Outside logic for Dropdown
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsCategoryOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // 3. Sorting Logic: Use 'createdAt' for newest first (as seen in your screenshot)
    const { currentItems, totalPages, firstIdx, lastIdx, totalCount } = useMemo(() => {
        const sorted = [...filteredEvents].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        const last = currentPage * itemsPerPage;
        const first = last - itemsPerPage;

        return {
            currentItems: sorted.slice(first, last),
            totalPages: Math.ceil(sorted.length / itemsPerPage) || 1,
            firstIdx: first,
            lastIdx: last,
            totalCount: sorted.length
        };
    }, [filteredEvents, currentPage, itemsPerPage]);

    const handleSuccess = (apiResponse) => {
        const newEvent = apiResponse?.event; // Grab the object from the { message, event } wrapper
        if (newEvent) {
            // This hits the unshift() logic in the slice and adds it to UI immediately
            dispatch(addEvent(newEvent));
        }
        setIsModalOpen(false);
    };

    const categories = ["All Categories", "Fashion", "Music", "Tech"];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                        className="w-full pl-10 pr-4 h-11 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    />
                </div>

                <div className="relative w-full md:w-56" ref={dropdownRef}>
                    <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="w-full h-11 px-4 border border-slate-200 rounded-lg flex items-center justify-between bg-white hover:bg-slate-50 transition-all"
                    >
                        <span className="text-sm font-medium">{category}</span>
                        <ChevronDown size={16} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isCategoryOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { dispatch(setFilters({ category: cat })); setIsCategoryOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm ${category === cat ? 'bg-violet-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
                    className="h-11 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center justify-center gap-2 font-semibold shadow-md transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Create Event
                </button>
            </div>

            {/* Grid Display */}
            {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Refreshing list...</p>
                </div>
            ) : currentItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentItems.map((event) => (
                        <div
                            key={event.id || event._id}
                            onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                            className="cursor-pointer transition-transform hover:-translate-y-1"
                        >
                            <EventCard event={event} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center">
                    <CalendarDays className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-800">No events found</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your filters or create a new event.</p>
                </div>
            )}

            {/* Pagination */}
            {totalCount > 0 && (
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-500">
                        Showing <span className="font-bold text-slate-900">{firstIdx + 1}-{Math.min(lastIdx, totalCount)}</span> of {totalCount}
                    </p>
                    <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => dispatch(setCurrentPage(i + 1))}
                                className={`w-9 h-9 rounded-lg text-sm font-bold ${currentPage === i + 1 ? 'bg-violet-600 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <AddEventModal
                isOpen={isModalOpen}
                editingEvent={selectedEvent}
                onSuccess={handleSuccess}
                onClose={() => { setIsModalOpen(false); setSelectedEvent(null); }}
            />
        </div>
    );
};

export default EventPage;