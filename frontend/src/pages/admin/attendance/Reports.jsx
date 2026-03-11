import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Filter, Printer, Download, FileSpreadsheet, FileText, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceReports = () => {
    const [data, setData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        employee_id: '',
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/attendance/get_employees.php`);
            if (res.data.success) {
                setEmployees(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const generateReport = async () => {
        if (!filters.start_date || !filters.end_date) {
            toast.error('Date range is required');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/attendance/salary_calculation.php`, {
                params: filters
            });
            if (res.data.success) {
                setData(res.data.data);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const exportCSV = () => {
        if (data.length === 0) return toast.error('No data to export');

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Employee Name,Role,Department,Present Days,Absent Days,Holiday Days,Total Valid Days\n";

        data.forEach(row => {
            const totalDays = row.present_days + row.absent_days + row.holiday_days;
            csvContent += `"${row.name}","${row.role}","${row.department}",${row.present_days},${row.absent_days},${row.holiday_days},${totalDays}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_Report_${filters.start_date}_to_${filters.end_date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Attendance Reports</h1>
                    <p className="text-slate-500">Generate and export multi-format attendance reports</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handlePrint} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium flex items-center gap-2 transition">
                        <Printer size={18} /> Print
                    </button>
                    <button onClick={exportCSV} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-xl font-medium flex items-center gap-2 transition border border-indigo-200 dark:border-indigo-500/30">
                        <FileSpreadsheet size={18} /> Export Excel/CSV
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-8 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Employee</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 text-slate-400" size={18} />
                            <select
                                value={filters.employee_id}
                                onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                            >
                                <option value="">All Employees</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="date"
                                value={filters.start_date}
                                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="date"
                                value={filters.end_date}
                                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                            />
                        </div>
                    </div>
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 font-bold transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Filter size={18} />}
                        Generate Report
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 items-center justify-between hidden print:flex">
                    <h2 className="text-xl font-bold">Attendance Report: {filters.start_date} to {filters.end_date}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">Employee</th>
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">Role</th>
                                <th className="py-4 px-6 font-semibold text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Present</th>
                                <th className="py-4 px-6 font-semibold text-sm text-rose-600 dark:text-rose-400 whitespace-nowrap">Absent</th>
                                <th className="py-4 px-6 font-semibold text-sm text-amber-600 dark:text-amber-400 whitespace-nowrap">Holiday</th>
                                <th className="py-4 px-6 font-semibold text-sm text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Total Logged</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-500">
                                        No data to display. Please generate a report.
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => {
                                    const total = row.present_days + row.absent_days + row.holiday_days;
                                    return (
                                        <motion.tr
                                            key={idx}
                                            className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition"
                                        >
                                            <td className="py-4 px-6 font-medium text-slate-800 dark:text-white">
                                                <div className="flex flex-col">
                                                    <span>{row.name}</span>
                                                    <span className="text-xs text-slate-400">{row.department}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-xs font-medium">{row.role}</span>
                                            </td>
                                            <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/30 dark:bg-emerald-500/5">{row.present_days}</td>
                                            <td className="py-4 px-6 text-rose-600 dark:text-rose-400 font-bold bg-rose-50/30 dark:bg-rose-500/5">{row.absent_days}</td>
                                            <td className="py-4 px-6 text-amber-600 dark:text-amber-400 font-bold bg-amber-50/30 dark:bg-amber-500/5">{row.holiday_days}</td>
                                            <td className="py-4 px-6 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/30 dark:bg-indigo-500/5">{total}</td>
                                        </motion.tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReports;
