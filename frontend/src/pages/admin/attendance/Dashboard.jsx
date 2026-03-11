import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, UserX, CalendarHeart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"
    >
        <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${colorClass}`}>
            <Icon size={24} className="text-white" />
        </div>
    </motion.div>
);

const AttendanceDashboard = () => {
    const [data, setData] = useState({
        total_employees: 0,
        present_today: 0,
        absent_today: 0,
        upcoming_holidays: [],
        attendance_percentage: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost/sales_manage/backend/api/attendance/dashboard.php`);
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (error) {
                console.error("Dashboard error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">HR & Attendance Dashboard</h1>
                <p className="text-slate-500">Overview of today's attendance and upcoming holidays.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Employees"
                    value={data.total_employees}
                    icon={Users}
                    colorClass="bg-blue-500 shadow-lg shadow-blue-500/30"
                />
                <StatCard
                    title="Present Today"
                    value={data.present_today}
                    icon={UserCheck}
                    colorClass="bg-emerald-500 shadow-lg shadow-emerald-500/30"
                />
                <StatCard
                    title="Absent Today"
                    value={data.absent_today}
                    icon={UserX}
                    colorClass="bg-rose-500 shadow-lg shadow-rose-500/30"
                />
                <StatCard
                    title="Monthly Attendance"
                    value={`${data.attendance_percentage}%`}
                    icon={Activity}
                    colorClass="bg-indigo-500 shadow-lg shadow-indigo-500/30"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <CalendarHeart className="text-rose-500" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Upcoming Holidays</h2>
                </div>
                {data.upcoming_holidays.length === 0 ? (
                    <p className="text-slate-500 text-sm">No holidays coming soon.</p>
                ) : (
                    <div className="space-y-4">
                        {data.upcoming_holidays.map((h, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg">
                                        {new Date(h.holiday_date).getDate()}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800 text-sm md:text-base dark:text-white">{h.holiday_name}</h4>
                                        <p className="text-xs text-slate-500">{new Date(h.holiday_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {h.holiday_type}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default AttendanceDashboard;
