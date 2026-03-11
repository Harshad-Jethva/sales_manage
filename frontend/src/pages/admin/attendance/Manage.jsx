import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, UserCheck, UserX, Sun, CheckCircle, X, Save, CalendarHeart, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceManage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Month navigation
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    // Calendar logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handleDateClick = async (day) => {
        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(formattedDate);
        setIsModalOpen(true);
        await fetchAttendance(formattedDate);
    };

    const fetchAttendance = async (dateStr) => {
        setLoading(true);
        try {
            // Fetch all employees first to ensure we have the list
            const empRes = await axios.get(`http://localhost/sales_manage/backend/api/attendance/get_employees.php`);
            let emps = [];
            if (empRes.data.success) {
                emps = empRes.data.data;
                setEmployees(emps);
            }

            // Fetch attendance for the specific date
            const attRes = await axios.get(`http://localhost/sales_manage/backend/api/attendance/manage.php?date=${dateStr}`);
            let records = [];
            if (attRes.data.success) {
                records = attRes.data.data;
            }

            // Merge data
            const newAttData = {};
            emps.forEach(emp => {
                const existing = records.find(r => r.employee_id === emp.id);
                newAttData[emp.id] = existing ? existing.status : 'present'; // Default to present
            });
            setAttendanceData(newAttData);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (empId, status) => {
        setAttendanceData({ ...attendanceData, [empId]: status });
    };

    const markAll = (status) => {
        const newAtt = {};
        employees.forEach(emp => {
            newAtt[emp.id] = status;
        });
        setAttendanceData(newAtt);
    };

    const saveAttendance = async () => {
        const records = employees.map(emp => ({
            employee_id: emp.id,
            status: attendanceData[emp.id]
        }));

        try {
            const payload = {
                date: selectedDate,
                records
            };
            const res = await axios.post(`http://localhost/sales_manage/backend/api/attendance/manage.php`, payload);
            if (res.data.success) {
                toast.success('Attendance saved successfully');
                setIsModalOpen(false);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to save attendance');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Attendance Calendar</h1>
                    <p className="text-slate-500">Select a date to manage attendance</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar className="text-indigo-500" />
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-4 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold text-slate-500 text-sm py-2">
                            {day}
                        </div>
                    ))}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-24 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isToday =
                            new Date().getDate() === day &&
                            new Date().getMonth() === currentDate.getMonth() &&
                            new Date().getFullYear() === currentDate.getFullYear();

                        return (
                            <motion.button
                                key={day}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDateClick(day)}
                                className={`h-24 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${isToday
                                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800'
                                    : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg dark:bg-slate-800 dark:border-slate-700'
                                    }`}
                            >
                                <span className={`text-lg font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {day}
                                </span>
                                {isToday && <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Today</span>}
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                        <CalendarHeart className="text-rose-500" />
                                        Attendance for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1">Mark present, absent, or holiday</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"
                                >
                                    <X />
                                </button>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-3">
                                <span className="text-sm font-semibold text-slate-500 self-center mr-2">Quick Actions:</span>
                                <button onClick={() => markAll('present')} className="px-4 py-2 text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg flex items-center gap-2 font-medium transition">
                                    <UserCheck size={16} /> Mark All Present
                                </button>
                                <button onClick={() => markAll('absent')} className="px-4 py-2 text-sm bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-400 rounded-lg flex items-center gap-2 font-medium transition">
                                    <UserX size={16} /> Mark All Absent
                                </button>
                                <button onClick={() => markAll('holiday')} className="px-4 py-2 text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 rounded-lg flex items-center gap-2 font-medium transition">
                                    <Sun size={16} /> Mark All Holiday
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/50">
                                {loading ? (
                                    <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>
                                ) : employees.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-3">
                                        <Users size={48} className="opacity-20" />
                                        <p>No employees found in the system</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {employees.map(emp => (
                                            <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                                                <div className="mb-4 sm:mb-0">
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">{emp.name}</h4>
                                                    <div className="flex gap-2 text-xs font-medium mt-1">
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-md">{emp.role}</span>
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-md">{emp.department}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusChange(emp.id, 'present')}
                                                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${attendanceData[emp.id] === 'present'
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-700 dark:hover:bg-emerald-500/10'
                                                            }`}
                                                    >
                                                        <UserCheck size={16} /> Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(emp.id, 'absent')}
                                                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${attendanceData[emp.id] === 'absent'
                                                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-700 dark:hover:bg-rose-500/10'
                                                            }`}
                                                    >
                                                        <UserX size={16} /> Absent
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(emp.id, 'holiday')}
                                                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${attendanceData[emp.id] === 'holiday'
                                                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600 dark:bg-slate-700 dark:hover:bg-amber-500/10'
                                                            }`}
                                                    >
                                                        <Sun size={16} /> Holiday
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end gap-3 rounded-b-3xl">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveAttendance}
                                    className="px-6 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Save Attendance
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AttendanceManage;
