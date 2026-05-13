import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFilteredEvents, setFilters, setCurrentPage, setEvents } from "../features/eventSlice";
import EventCard from "../components/EventCard";
import AddEventModal from "../components/EventModal";
import { Search } from "lucide-react";
import useApi from "../hooks/useApi"; // Import Hook

const EventPage = () => {
    const dispatch = useDispatch();
    const { execute, loading } = useApi(); // Initialize Hook
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    const filteredEvents = useSelector(selectFilteredEvents);
    const { currentPage, itemsPerPage } = useSelector((state) => state.events.pagination);
    const { search, category } = useSelector((state) => state.events.filters);

    // Fetch data from API
    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await execute('/events', 'GET');
            if (data) {
                dispatch(setEvents(data)); // Sync backend data with Redux
            }
        };
        fetchEvents();
    }, [execute, dispatch]);

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

    const handleCreateClick = () => {
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={search}
                            onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                            className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-violet-500 text-sm"
                        />
                    </div>
                    <select
                        value={category}
                        onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
                        className="h-11 px-4 border border-slate-200 rounded-lg bg-slate-50 outline-none text-sm min-w-[220px]"
                    >
                        <option value="All Categories">All Categories</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Music">Music</option>
                        <option value="Tech">Tech</option>
                    </select>
                    <button 
                        onClick={handleCreateClick} 
                        className="h-11 px-5 bg-violet-600 hover:bg-violet-700 rounded-lg text-white text-sm font-medium transition-all"
                    >
                        Create Event
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                </div>
            ) : currentItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {currentItems.map((event) => (
                        <div 
                            key={event.id || event._id} 
                            onClick={() => handleEditClick(event)} 
                            className="cursor-pointer active:scale-[0.98] transition-transform"
                        >
                            <EventCard event={event} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl h-[300px] flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-2">No Events Found</h2>
                        <p className="text-slate-500">No events available in this category.</p>
                    </div>
                </div>
            )}

            {/* Pagination remains the same */}
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-semibold text-slate-900">{firstIdx + 1}-{Math.min(lastIdx, filteredEvents.length)}</span> of <span className="font-semibold text-slate-900">{filteredEvents.length}</span>
                </p>
                <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => dispatch(setCurrentPage(i + 1))}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                currentPage === i + 1 ? "bg-violet-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
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
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEvent(null);
                }} 
            />
        </div>
    );
};

export default EventPage;