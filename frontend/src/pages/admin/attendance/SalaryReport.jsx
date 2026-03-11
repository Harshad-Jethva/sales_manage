import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Printer, Download, FileSpreadsheet, FileText, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const SalaryReport = () => {
    const [data, setData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

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
        setExpandedRow(null);
        try {
            // We reuse the salary_calculation API
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
        csvContent += "Employee Name,Role,Monthly Salary,Per Day Salary,Present Days,Absent Days,Holiday Days,Payable Salary\n";

        data.forEach(row => {
            csvContent += `"${row.name}","${row.role}",${row.monthly_salary},${row.per_day_salary},${row.present_days},${row.absent_days},${row.holiday_days},${row.payable_salary}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Salary_Report_${filters.start_date}_to_${filters.end_date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleRow = (idx) => {
        setExpandedRow(expandedRow === idx ? null : idx);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Salary Reports</h1>
                    <p className="text-slate-500">Generate, view, and export detailed salary calculations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handlePrint} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium flex items-center gap-2 transition">
                        <Printer size={18} /> Print
                    </button>
                    <button onClick={exportCSV} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-xl font-medium flex items-center gap-2 transition border border-indigo-200 dark:border-indigo-500/30">
                        <FileSpreadsheet size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-8 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Employee</label>
                        <select
                            value={filters.employee_id}
                            onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                        />
                    </div>
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 font-bold transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Filter size={18} />}
                        Generate Salary Report
                    </button>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 items-center justify-between hidden print:flex">
                    <h2 className="text-xl font-bold">Salary Report: {filters.start_date} to {filters.end_date}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Employee</th>
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Payable Status (Days)</th>
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Salary Info</th>
                                <th className="py-4 px-6 font-semibold text-sm text-center text-slate-600 dark:text-slate-400">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-500">
                                        No data to display. Please generate a report.
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <React.Fragment key={idx}>
                                        <motion.tr
                                            className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                                            onClick={() => toggleRow(idx)}
                                        >
                                            <td className="py-4 px-6 font-medium text-slate-800 dark:text-white">
                                                <div className="flex flex-col">
                                                    <span className="text-base font-bold">{row.name}</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">{row.role} | {row.department}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex gap-3">
                                                    <div className="flex flex-col items-center p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg min-w-16">
                                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Pre</span>
                                                        <span className="font-bold text-slate-800 dark:text-white">{row.present_days}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg min-w-16">
                                                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Abs</span>
                                                        <span className="font-bold text-slate-800 dark:text-white">{row.absent_days}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg min-w-16">
                                                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Hol</span>
                                                        <span className="font-bold text-slate-800 dark:text-white">{row.holiday_days}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between w-32">
                                                        <span className="text-xs text-slate-500">Monthly:</span>
                                                        <span className="text-sm font-semibold">₹{row.monthly_salary}</span>
                                                    </div>
                                                    <div className="flex justify-between w-32 border-b border-slate-200 dark:border-slate-700 pb-1">
                                                        <span className="text-xs text-slate-500">Per Day:</span>
                                                        <span className="text-sm font-semibold">₹{row.per_day_salary}</span>
                                                    </div>
                                                    <div className="flex justify-between w-32 pt-1">
                                                        <span className="text-sm text-indigo-600 dark:text-indigo-400 font-bold">Payable:</span>
                                                        <span className="text-sm font-bold text-slate-800 dark:text-white">₹{row.payable_salary}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full transition">
                                                    {expandedRow === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </button>
                                            </td>
                                        </motion.tr>

                                        <AnimatePresence>
                                            {expandedRow === idx && (
                                                <motion.tr
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-slate-50 dark:bg-slate-900/30"
                                                >
                                                    <td colSpan="4" className="py-6 px-8 border-t border-slate-100 dark:border-slate-700">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {/* Present Dates */}
                                                            <div>
                                                                <h4 className="font-bold text-sm text-emerald-600 mb-3 flex items-center gap-2">
                                                                    Present Dates ({row.present_dates.length})
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                                    {row.present_dates.map(d => (
                                                                        <span key={d} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-medium">
                                                                            {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                        </span>
                                                                    ))}
                                                                    {row.present_dates.length === 0 && <span className="text-xs text-slate-400">None</span>}
                                                                </div>
                                                            </div>

                                                            {/* Absent Dates */}
                                                            <div>
                                                                <h4 className="font-bold text-sm text-rose-600 mb-3 flex items-center gap-2">
                                                                    Absent Dates ({row.absent_dates.length})
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                                    {row.absent_dates.map(d => (
                                                                        <span key={d} className="px-2 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 rounded-md text-xs font-medium">
                                                                            {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                        </span>
                                                                    ))}
                                                                    {row.absent_dates.length === 0 && <span className="text-xs text-slate-400">None</span>}
                                                                </div>
                                                            </div>

                                                            {/* Holiday Dates */}
                                                            <div>
                                                                <h4 className="font-bold text-sm text-amber-600 mb-3 flex items-center gap-2">
                                                                    Holiday Dates ({row.holiday_dates.length})
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                                    {row.holiday_dates.map(d => (
                                                                        <span key={d} className="px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-md text-xs font-medium">
                                                                            {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                        </span>
                                                                    ))}
                                                                    {row.holiday_dates.length === 0 && <span className="text-xs text-slate-400">None</span>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center print:hidden">
                                                            <p className="text-sm text-slate-500 italic">
                                                                {row.holiday_policy === 'unpaid'
                                                                    ? 'Calculation: Present Days × Per Day (Unpaid Holidays)'
                                                                    : 'Calculation: (Present + Holiday) × Per Day'}
                                                            </p>
                                                            <button onClick={handlePrint} className="px-4 py-2 bg-slate-800 dark:bg-white text-white dark:text-slate-800 text-sm font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-slate-800/20 transition hover:scale-105">
                                                                <Printer size={16} /> Print Payslip
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalaryReport;
