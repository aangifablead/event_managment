import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import useApi from '../hooks/useApi';
import { 
    LuFilter, 
    LuChevronDown, 
    LuChevronLeft, 
    LuChevronRight, 
    LuCalendar, 
    LuMapPin, 
    LuX, 
    LuCheck,
    LuUsers
} from "react-icons/lu";

const CalendarPage = () => {
    const calendarRef = useRef(null);
    const dropdownRef = useRef(null);
    const datePickerRef = useRef(null);
    const { execute } = useApi();
    
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [currentTitle, setCurrentTitle] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    // UI States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [viewDate, setViewDate] = useState(new Date());

    const categories = ['All', 'Fashion', 'Music', 'Tech', 'Art'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    useEffect(() => {
        const fetchEvents = async () => {
            const { data } = await execute('/events');
            if (data) {
                const formatted = data.map(event => ({
                    id: event._id,
                    title: event.name,
                    start: event.date,
                    backgroundColor: event.category === 'Fashion' ? '#FCE7F3' : '#EEF2FF',
                    textColor: event.category === 'Fashion' ? '#DB2777' : '#6366F1',
                    borderColor: 'transparent',
                    extendedProps: { 
                        ...event,
                        displayLocation: event.location || `${event.venue}, ${event.city}`,
                        displayTime: event.time || '8:00 PM',
                        displayImage: event.image,
                    }
                }));
                setEvents(formatted);
                setFilteredEvents(formatted);
            }
        };
        fetchEvents();
    }, [execute]);

    // Handle Clicks Outside for Dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsFilterOpen(false);
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) setIsDatePickerOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateSelect = (monthIndex) => {
        const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
        calendarRef.current.getApi().gotoDate(newDate);
        setIsDatePickerOpen(false);
    };

    const changeYear = (offset) => {
        const d = new Date(viewDate);
        d.setFullYear(d.getFullYear() + offset);
        setViewDate(d);
    };

    const handleFilterSelect = (category) => {
        setActiveFilter(category);
        setIsFilterOpen(false);
        if (category === 'All') {
            setFilteredEvents(events);
        } else {
            setFilteredEvents(events.filter(ev => ev.extendedProps.category === category));
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden p-3 md:p-5 relative font-sans">
            <div className="flex w-full h-full bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden relative">
                
                {/* Main Calendar Section */}
                <div className="flex-grow flex flex-col p-4 md:p-8 min-w-0 h-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 shrink-0">
                        
                        {/* Month & Year Picker */}
                        <div className="relative" ref={datePickerRef}>
                            <button 
                                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                className="flex items-center space-x-2 group"
                            >
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800 group-hover:text-[#5D5FEF] transition-colors">
                                    {currentTitle}
                                </h2>
                                <LuChevronDown className={`text-slate-400 transition-transform ${isDatePickerOpen ? 'rotate-180 text-[#5D5FEF]' : ''}`} />
                            </button>

                            {isDatePickerOpen && (
                                <div className="absolute left-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-[110] animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <button onClick={() => changeYear(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><LuChevronLeft /></button>
                                        <span className="font-bold text-slate-700">{viewDate.getFullYear()}</span>
                                        <button onClick={() => changeYear(1)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><LuChevronRight /></button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {months.map((month, idx) => (
                                            <button
                                                key={month}
                                                onClick={() => handleDateSelect(idx)}
                                                className={`py-2 text-sm rounded-xl transition-all ${
                                                    currentTitle.includes(month) 
                                                    ? 'bg-[#5D5FEF] text-white font-bold shadow-md' 
                                                    : 'hover:bg-slate-50 text-slate-600'
                                                }`}
                                            >
                                                {month}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls: Nav + Filter */}
                        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                            {/* Prev/Next Buttons */}
                            <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                                <button onClick={() => calendarRef.current.getApi().prev()} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
                                    <LuChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => calendarRef.current.getApi().next()} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
                                    <LuChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Category Filter Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border
                                        ${isFilterOpen ? 'bg-white border-[#5D5FEF] text-[#5D5FEF] shadow-md' : 'bg-[#F0F2FD] border-transparent text-[#5D5FEF]'}
                                    `}
                                >
                                    <LuFilter className="w-4 h-4 mr-2" />
                                    <span>{activeFilter === 'All' ? 'Filter' : activeFilter}</span>
                                    <LuChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isFilterOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[100] animate-in fade-in zoom-in-95">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => handleFilterSelect(cat)}
                                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-[#5D5FEF] transition-colors"
                                            >
                                                {cat}
                                                {activeFilter === cat && <LuCheck className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Calendar Harness */}
                    <div className="flex-grow min-h-0 calendar-container">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={filteredEvents}
                            height="100%"
                            headerToolbar={false}
                            datesSet={(arg) => setCurrentTitle(arg.view.title)}
                            eventClick={(info) => setSelectedEvent(info.event.extendedProps)}
                        />
                    </div>
                </div>

                {/* Event Detail Sidebar */}
                <div className={`
                    absolute inset-y-0 right-0 z-[120] w-full sm:w-[400px] lg:w-[380px] 
                    bg-white border-l border-slate-100 flex flex-col transition-transform duration-500
                    ${selectedEvent ? 'translate-x-0' : 'translate-x-full'}
                    shadow-2xl lg:shadow-none
                `}>
                    {selectedEvent && (
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="relative h-64 shrink-0 m-5">
                                <img src={selectedEvent.displayImage} className="w-full h-full object-cover rounded-[32px]" alt="" />
                                <button 
                                    onClick={() => setSelectedEvent(null)} 
                                    className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/60 transition-all"
                                >
                                    <LuX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-8 flex-grow overflow-y-auto custom-scrollbar pb-8">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{selectedEvent.name}</h3>
                                    <span className="inline-block px-3 py-1 bg-pink-50 text-pink-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                        {selectedEvent.category}
                                    </span>
                                </div>

                                <div className="space-y-5 mb-8">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-4">
                                            <LuCalendar className="text-slate-400 w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-slate-700">{selectedEvent.date} — {selectedEvent.displayTime}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-4">
                                            <LuMapPin className="text-slate-400 w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-slate-700">{selectedEvent.displayLocation}</span>
                                    </div>
                                </div>

                                <div className="bg-[#F8FAFC] rounded-[28px] p-6 border border-slate-100 mt-auto">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Starting from</span>
                                            <div className="text-2xl font-black text-slate-900 mt-1">₹{selectedEvent.price?.toLocaleString() || '1,200'}</div>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <LuUsers className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #F1F5F9 !important; }
                .fc-scrollgrid { border: none !important; }
                .fc-col-header-cell { padding: 12px 0 !important; color: #94A3B8 !important; font-size: 11px !important; text-transform: uppercase; letter-spacing: 0.05em; }
                .fc-day-today { background: transparent !important; }
                .fc-day-today .fc-daygrid-day-number { 
                    background: #5D5FEF; 
                    color: white !important; 
                    border-radius: 10px; 
                    width: 32px; 
                    height: 32px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    margin: 6px !important; 
                }
                .fc-daygrid-day-number { font-size: 14px; font-weight: 600; color: #64748B; padding: 10px !important; text-decoration: none !important; }
                .fc-event { border-radius: 8px !important; border: none !important; margin: 2px 5px !important; padding: 2px 4px !important; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .calendar-container .fc-view-harness { height: 100% !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default CalendarPage;