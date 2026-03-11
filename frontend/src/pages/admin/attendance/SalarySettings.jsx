import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, User, Wallet, CalendarDays, Key, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const SalarySettings = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/attendance/salary_settings.php`);
            if (res.data.success) {
                setEmployees(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (id, field, value) => {
        setEmployees(prev =>
            prev.map(emp => (emp.employee_id === id ? { ...emp, [field]: value } : emp))
        );
    };

    const calculatePerDay = (monthly, days) => {
        if (!monthly || !days || days == 0) return '0.00';
        return (parseFloat(monthly) / parseFloat(days)).toFixed(2);
    };

    const handleSave = async (emp) => {
        if (!emp.monthly_salary || emp.monthly_salary <= 0) {
            toast.error('Please enter a valid monthly salary');
            return;
        }

        try {
            const payload = {
                employee_id: emp.employee_id,
                monthly_salary: emp.monthly_salary,
                working_days: emp.working_days,
                holiday_policy: emp.holiday_policy
            };
            const res = await axios.post(`http://localhost/sales_manage/backend/api/attendance/salary_settings.php`, payload);
            if (res.data.success) {
                toast.success(`${emp.name}'s settings saved`);
                fetchSettings(); // Refresh to get recalculated per_day_salary from server if needed, though we calc it frontend too
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Salary Settings</h1>
                <p className="text-slate-500">Configure salary structure for each employee</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Employee</th>
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Monthly Salary (₹)</th>
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Working Days / Month</th>
                                <th className="py-4 px-6 font-semibold text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Per Day Salary (Auto)</th>
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Holiday Policy</th>
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400 w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">Loading employees...</td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-500 text-sm border-t border-slate-100 dark:border-slate-700/50">No employees found</td>
                                </tr>
                            ) : (
                                employees.map((emp) => {
                                    const perDay = calculatePerDay(emp.monthly_salary, emp.working_days);
                                    return (
                                        <motion.tr
                                            key={emp.employee_id}
                                            className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition group"
                                        >
                                            <td className="py-4 px-6 font-medium text-slate-800 dark:text-white">
                                                <div className="flex flex-col">
                                                    <span>{emp.name}</span>
                                                    <span className="text-xs text-slate-400">{emp.role}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="relative w-40">
                                                    <Wallet className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                                    <input
                                                        type="number"
                                                        value={emp.monthly_salary}
                                                        onChange={(e) => handleInputChange(emp.employee_id, 'monthly_salary', e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="relative w-28">
                                                    <CalendarDays className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                                    <input
                                                        type="number"
                                                        value={emp.working_days}
                                                        onChange={(e) => handleInputChange(emp.employee_id, 'working_days', e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-xl w-32 border border-emerald-100 dark:border-emerald-500/20">
                                                    <span>₹</span> {perDay}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <select
                                                    value={emp.holiday_policy || 'paid'}
                                                    onChange={(e) => handleInputChange(emp.employee_id, 'holiday_policy', e.target.value)}
                                                    className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                                                >
                                                    <option value="paid">Paid</option>
                                                    <option value="unpaid">Unpaid</option>
                                                </select>
                                            </td>
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => handleSave(emp)}
                                                    className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500 dark:hover:text-white rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-500/30 transition shadow-indigo-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                    title="Save Settings"
                                                >
                                                    <Save size={18} />
                                                </button>
                                            </td>
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

export default SalarySettings;
