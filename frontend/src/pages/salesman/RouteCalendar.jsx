import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    MapPin,
    Phone,
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle,
    RotateCcw,
    Filter,
    LayoutDashboard,
    CalendarDays,
    CalendarRange,
    ClipboardList,
    MoreVertical,
    FileText,
    TrendingUp,
    Check
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

const RouteCalendar = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); // month, week, year, day
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDateRoutes, setSelectedDateRoutes] = useState(null);
    const [selectedDetailRoute, setSelectedDetailRoute] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchRoutes();
    }, [user, currentDate, view]);

    const fetchRoutes = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/route_calendar.php?action=get_my_routes&salesman_id=${user.id}`);
            if (response.data.success) {
                setRoutes(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching routes:", error);
            toast.error("Failed to load routes");
        } finally {
            setLoading(false);
        }
    };

    const fetchRouteDetails = async (routeId) => {
        try {
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/route_calendar.php?action=get_route_details&route_id=${routeId}`);
            if (response.data.success) {
                setSelectedDetailRoute(response.data.data);
                setIsDetailOpen(true);
            }
        } catch (error) {
            console.error("Error fetching route details:", error);
            toast.error("Failed to load route details");
        }
    };

    const updateStatus = async (visitId, newStatus) => {
        setIsUpdatingStatus(true);
        try {
            const response = await axios.post(`http://localhost/sales_manage/backend/api/salesman/route_calendar.php?action=update_visit_status`, {
                visit_id: visitId,
                status: newStatus
            });
            if (response.data.success) {
                toast.success(`Status updated to ${newStatus}`);
                if (selectedDetailRoute) {
                    const updatedClients = selectedDetailRoute.clients.map(c =>
                        c.visit_id === visitId ? { ...c, status: newStatus } : c
                    );
                    setSelectedDetailRoute({ ...selectedDetailRoute, clients: updatedClients });
                }
                fetchRoutes(); // Refresh calendar counts
            }
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const updateNotes = async (visitId, notes) => {
        try {
            const response = await axios.post(`http://localhost/sales_manage/backend/api/salesman/route_calendar.php?action=update_visit_notes`, {
                visit_id: visitId,
                notes: notes
            });
            if (response.data.success) {
                toast.success("Notes updated");
            }
        } catch (error) {
            toast.error("Failed to update notes");
        }
    };

    // Calendar Helper Functions
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const calendarHeader = useMemo(() => {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (view === 'year') return `${currentDate.getFullYear()}`;
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }, [currentDate, view]);

    const days = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysArray = [];

        if (view === 'month') {
            const daysInMonth = getDaysInMonth(year, month);
            const firstDay = getFirstDayOfMonth(year, month);

            // Previous month days
            const prevMonthDays = getDaysInMonth(year, month - 1);
            for (let i = firstDay - 1; i >= 0; i--) {
                daysArray.push({
                    day: prevMonthDays - i,
                    month: month - 1,
                    year: year,
                    currentMonth: false
                });
            }

            // Current month days
            for (let i = 1; i <= daysInMonth; i++) {
                daysArray.push({
                    day: i,
                    month: month,
                    year: year,
                    currentMonth: true
                });
            }

            // Next month days
            const remainingCells = 42 - daysArray.length;
            for (let i = 1; i <= remainingCells; i++) {
                daysArray.push({
                    day: i,
                    month: month + 1,
                    year: year,
                    currentMonth: false
                });
            }
        } else if (view === 'week') {
            // Get the start of the week (Sunday)
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

            for (let i = 0; i < 7; i++) {
                const d = new Date(startOfWeek);
                d.setDate(startOfWeek.getDate() + i);
                daysArray.push({
                    day: d.getDate(),
                    month: d.getMonth(),
                    year: d.getFullYear(),
                    currentMonth: d.getMonth() === month
                });
            }
        } else if (view === 'day') {
            daysArray.push({
                day: currentDate.getDate(),
                month: currentDate.getMonth(),
                year: currentDate.getFullYear(),
                currentMonth: true
            });
        } else if (view === 'year') {
            for (let i = 0; i < 12; i++) {
                daysArray.push({ month: i, year: year, isYearView: true });
            }
        }

        return daysArray;
    }, [currentDate, view]);

    const navigate = (direction) => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(currentDate.getMonth() + direction);
        } else if (view === 'week') {
            newDate.setDate(currentDate.getDate() + (direction * 7));
        } else if (view === 'day') {
            newDate.setDate(currentDate.getDate() + direction);
        } else if (view === 'year') {
            newDate.setFullYear(currentDate.getFullYear() + direction);
        }
        setCurrentDate(newDate);
    };

    const navigateToday = () => {
        setCurrentDate(new Date());
    };

    const getRouteForDate = (dateObj) => {
        const dateStr = `${dateObj.year}-${String(dateObj.month + 1).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`;
        return routes.find(r => r.route_date === dateStr);
    };

    const handleDateClick = (dateObj) => {
        const route = getRouteForDate(dateObj);
        if (route) {
            fetchRouteDetails(route.route_id);
        } else {
            toast.dismiss();
            toast("No route assigned for this date", { icon: 'ℹ️', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Visited': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
            case 'Collection Completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'Pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Visited': return <Clock size={14} />;
            case 'Collection Completed': return <CheckCircle2 size={14} />;
            case 'Pending': return <AlertCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    if (loading && routes.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="route-calendar-container p-4 lg:p-8 min-h-screen">
            <Helmet>
                <title>Route Calendar | Salesman Panel</title>
            </Helmet>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
                            <CalendarIcon className="text-indigo-500" />
                            Route Calendar
                        </h1>
                        <p className="text-gray-400 mt-1">Manage your field visits and collections assigned by Admin.</p>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
                            <button
                                onClick={() => setView('year')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'year' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Year
                            </button>
                            <button
                                onClick={() => setView('month')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'month' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setView('week')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'week' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setView('day')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'day' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Day
                            </button>
                        </div>

                        <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all backdrop-blur-md">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Calendar Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white min-w-[200px]">{calendarHeader}</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={navigateToday} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                                Today
                            </button>
                            <button onClick={() => navigate(1)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-xs text-gray-400">Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                            <span className="text-xs text-gray-400">Visited</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-gray-400">Completed</span>
                        </div>
                    </div>
                </div>

                {/* Main Calendar View */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
                    {/* Weekdays Header */}
                    <div className={`grid ${view === 'day' ? 'grid-cols-1' : 'grid-cols-7'} border-b border-white/10 bg-white/5`}>
                        {view === 'day' ? (
                            <div className="py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()]}
                            </div>
                        ) : (
                            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {day}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Days/Months Grid */}
                    <div className={`grid ${view === 'day' ? 'grid-cols-1' : view === 'year' ? 'grid-cols-3 lg:grid-cols-4' : 'grid-cols-7'}`}>
                        {days.map((dateObj, idx) => {
                            if (dateObj.isYearView) {
                                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                const routesInMonth = routes.filter(r => {
                                    const d = new Date(r.route_date);
                                    return d.getMonth() === dateObj.month && d.getFullYear() === dateObj.year;
                                });

                                return (
                                    <motion.div
                                        key={`month-${idx}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => { setCurrentDate(new Date(dateObj.year, dateObj.month, 1)); setView('month'); }}
                                        className="min-h-[150px] p-6 border-r border-b border-white/5 flex flex-col items-center justify-center gap-4 hover:bg-white/[0.05] transition-all cursor-pointer group"
                                    >
                                        <h3 className="text-lg font-bold text-gray-300 group-hover:text-indigo-400 transition-colors">
                                            {monthNames[dateObj.month]}
                                        </h3>
                                        {routesInMonth.length > 0 ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-3xl font-black text-white">{routesInMonth.length}</span>
                                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Routes Assigned</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-600 italic">No routes</span>
                                        )}
                                    </motion.div>
                                );
                            }

                            const route = getRouteForDate(dateObj);
                            const isToday = new Date().toDateString() === new Date(dateObj.year, dateObj.month, dateObj.day).toDateString();

                            return (
                                <motion.div
                                    key={`day-${idx}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.01 }}
                                    onClick={() => handleDateClick(dateObj)}
                                    className={`min-h-[120px] p-2 border-r border-b border-white/5 group relative transition-all duration-300 cursor-pointer
                                        ${!dateObj.currentMonth ? 'bg-black/20' : 'hover:bg-white/[0.02]'}
                                        ${idx % 7 === 6 ? 'border-r-0' : ''}
                                        ${view === 'day' ? 'min-h-[400px] p-8' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all
                                            ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : dateObj.currentMonth ? 'text-gray-300' : 'text-gray-600'}
                                        `}>
                                            {dateObj.day}
                                        </span>
                                        {route && (
                                            <div className="flex items-center gap-1">
                                                <div className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-400">
                                                    {route.client_count} Clients
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {route && (
                                        <div className="mt-3 space-y-1.5">
                                            {route.status_summary.map((summary, sIdx) => (
                                                <div
                                                    key={sIdx}
                                                    className={`px-2 py-1 rounded-lg text-[10px] flex items-center justify-between border ${getStatusColor(summary.status)}`}
                                                >
                                                    <span className="truncate">{summary.status}</span>
                                                    <span className="font-bold">{summary.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!route && isToday && (
                                        <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-gray-500 italic">Rest Day / Admin-Assigned</span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Route Detail Slide-over Panel */}
            <AnimatePresence>
                {isDetailOpen && selectedDetailRoute && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDetailOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] lg:w-[600px] bg-[#0c0c0e] border-l border-white/10 z-[101] shadow-2xl flex flex-col"
                        >
                            {/* Panel Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Route Details</h3>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {new Date(selectedDetailRoute.plan.route_date).toLocaleDateString('en-GB', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Panel Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                                {/* Route Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Clients</p>
                                        <p className="text-2xl font-bold mt-1 text-white">{selectedDetailRoute.clients.length}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Completed</p>
                                        <p className="text-2xl font-bold mt-1 text-emerald-500">
                                            {selectedDetailRoute.clients.filter(c => c.status === 'Collection Completed').length}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Reach</p>
                                        <p className="text-lg font-bold mt-1 text-indigo-400 truncate">
                                            ₹{selectedDetailRoute.clients.reduce((sum, c) => sum + parseFloat(c.outstanding_amount), 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-8 flex items-center gap-2">
                                    <LayoutDashboard size={14} /> Assigned Clients List
                                </h4>

                                {/* Clients List */}
                                <div className="space-y-4">
                                    {selectedDetailRoute.clients.map((client, idx) => (
                                        <motion.div
                                            key={client.visit_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group relative"
                                        >
                                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group-hover:bg-white/[0.08]">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold border border-indigo-500/20">
                                                            {client.client_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-white transition-colors group-hover:text-indigo-400">{client.client_name}</h5>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                                <MapPin size={12} className="text-gray-600" />
                                                                {client.area_name} • {client.address}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${getStatusColor(client.status)}`}>
                                                        {getStatusIcon(client.status)}
                                                        {client.status}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone size={14} className="text-gray-500" />
                                                        <span className="text-gray-300">{client.mobile_number}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm justify-end">
                                                        <TrendingUp size={14} className="text-rose-400" />
                                                        <span className="text-rose-400 font-bold">₹{parseFloat(client.outstanding_amount).toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                {/* Bills Accordion-style list (always expanded here for clarity) */}
                                                {client.bills.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-white/5">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pending Bills</p>
                                                        <div className="space-y-2">
                                                            {client.bills.map((bill, bIdx) => (
                                                                <div key={bIdx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-black/20 border border-white/5">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText size={12} className="text-indigo-400" />
                                                                        <span className="text-gray-300">{bill.bill_number}</span>
                                                                        <span className="text-gray-500">• {new Date(bill.bill_date).toLocaleDateString('en-GB')}</span>
                                                                    </div>
                                                                    <span className="font-bold text-white">₹{parseFloat(bill.pending_amount).toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="mt-6 flex items-center gap-3">
                                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                                        <button
                                                            disabled={isUpdatingStatus}
                                                            onClick={() => updateStatus(client.visit_id, 'Pending')}
                                                            className={`text-[10px] font-bold py-2 rounded-lg border transition-all ${client.status === 'Pending' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                                        >
                                                            Pending
                                                        </button>
                                                        <button
                                                            disabled={isUpdatingStatus}
                                                            onClick={() => updateStatus(client.visit_id, 'Visited')}
                                                            className={`text-[10px] font-bold py-2 rounded-lg border transition-all ${client.status === 'Visited' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                                        >
                                                            Mark Visited
                                                        </button>
                                                        <button
                                                            disabled={isUpdatingStatus}
                                                            onClick={() => updateStatus(client.visit_id, 'Collection Completed')}
                                                            className={`text-[10px] font-bold py-2 rounded-lg border transition-all ${client.status === 'Collection Completed' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                                        >
                                                            Completed
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Notes Input */}
                                                <div className="mt-4 flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        defaultValue={client.notes}
                                                        onBlur={(e) => updateNotes(client.visit_id, e.target.value)}
                                                        placeholder="Add visit notes..."
                                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Panel Footer */}
                            <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                                <button
                                    onClick={() => window.location.href = `/salesman/place-order?route_id=${selectedDetailRoute.plan.route_id}`}
                                    className="w-full p-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98]"
                                >
                                    <ShoppingCart size={20} />
                                    Process Orders Now
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

// Simple ShoppingCart icon to avoid import issues
const ShoppingCart = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;

export default RouteCalendar;
