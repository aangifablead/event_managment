import React, { useEffect, useState, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import useApi from '../hooks/useApi';
import { LuFilter, LuChevronDown, LuChevronLeft, LuChevronRight, LuCalendar, LuMapPin, LuX, LuCheck } from "react-icons/lu";

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
    const [viewDate, setViewDate] = useState(new Date()); // Tracks the year/month for the picker

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

    // Close dropdowns when clicking outside
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
        setViewDate(new Date(viewDate.setFullYear(viewDate.getFullYear() + offset)));
    };

    const handleFilterSelect = (category) => {
        setActiveFilter(category);
        setIsFilterOpen(false);
        setFilteredEvents(category === 'All' ? events : events.filter(ev => ev.extendedProps.category === category));
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans relative p-4 md:p-6">
            <div className="flex flex-grow w-full h-full bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden relative">
                
                {/* Main Content */}
                <div className="flex-grow flex flex-col p-4 md:p-8 min-w-0 h-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
                        
                        {/* Month/Year Picker Header - Ref image_bd537c.png */}
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
                                        <button onClick={() => changeYear(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg"><LuChevronLeft /></button>
                                        <span className="font-bold text-slate-700">{viewDate.getFullYear()}</span>
                                        <button onClick={() => changeYear(1)} className="p-1.5 hover:bg-slate-100 rounded-lg"><LuChevronRight /></button>
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
                        
                        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between">
                            <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                                <button onClick={() => calendarRef.current.getApi().prev()} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
                                    <LuChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => calendarRef.current.getApi().next()} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
                                    <LuChevronRight className="w-5 h-5" />
                                </button>
                            </div>

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
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[100]">
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

                    <div className="flex-grow min-h-0">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={filteredEvents}
                            height="100%"
                            headerToolbar={false}
                            datesSet={(arg) => setCurrentTitle(arg.view.title)}
                            eventClick={(info) => setSelectedEvent(info.event.extendedProps)}
                            eventContent={(info) => (
                                <div className="flex flex-col px-1.5 py-0.5 overflow-hidden">
                                    <span className="font-bold text-[10px] md:text-[11px] truncate leading-tight">{info.event.title}</span>
                                    <span className="opacity-70 text-[9px] hidden sm:block">{info.event.extendedProps.displayTime}</span>
                                </div>
                            )}
                        />
                    </div>
                </div>

                {/* Event Sidebar */}
                <div className={`
                    absolute inset-y-0 right-0 z-[120] w-full sm:w-[400px] bg-white border-l border-slate-100 flex flex-col transition-transform duration-500
                    ${selectedEvent ? 'translate-x-0' : 'translate-x-full'}
                    lg:relative lg:translate-x-0 ${!selectedEvent && 'lg:hidden'}
                    sm:rounded-l-[40px] shadow-2xl lg:shadow-none
                `}>
                    {selectedEvent && (
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="relative h-64 shrink-0">
                                <img src={selectedEvent.displayImage} className="w-full h-full object-cover" alt="" />
                                <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 bg-black/30 backdrop-blur-md p-2.5 rounded-full text-white"><LuX className="w-5 h-5" /></button>
                            </div>
                            <div className="p-8 flex-grow overflow-y-auto">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedEvent.name}</h3>
                                <span className="inline-block px-3 py-1 bg-pink-50 text-pink-500 rounded-lg text-[10px] font-bold uppercase mb-8">{selectedEvent.category}</span>
                                <div className="space-y-4 mb-8 text-slate-600 text-sm">
                                    <div className="flex items-center"><LuCalendar className="mr-4 text-slate-400" />{selectedEvent.date} — {selectedEvent.displayTime}</div>
                                    <div className="flex items-center"><LuMapPin className="mr-4 text-slate-400" />{selectedEvent.displayLocation}</div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                                    <div className="flex justify-between"><span className="text-slate-500">Price</span><span className="font-bold">${selectedEvent.price}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span className="font-bold">{selectedEvent.capacity} Pax</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .fc { border: none !important; }
                .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #F1F5F9 !important; }
                .fc-col-header-cell { padding-bottom: 15px !important; color: #94A3B8 !important; font-size: 11px !important; text-transform: uppercase; }
                .fc-daygrid-day-number { font-size: 14px; font-weight: 500; color: #64748B; padding: 10px !important; }
                .fc-day-today .fc-daygrid-day-number { color: white !important; background: #5D5FEF; border-radius: 10px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin: 6px !important; }
                .fc-event { border-radius: 6px !important; border: none !important; margin: 2px 4px !important; }
            `}</style>
        </div>
    );
};

export default CalendarPage;