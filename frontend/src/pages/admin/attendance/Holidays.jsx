import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Plus, Calendar, Save, X, Umbrella, CalendarHeart } from 'lucide-react';
import toast from 'react-hot-toast';

const HolidaySettings = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHoliday, setSelectedHoliday] = useState(null);

    const [formData, setFormData] = useState({
        id: '',
        holiday_name: '',
        holiday_date: '',
        holiday_type: 'Public'
    });

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/attendance/holidays.php`);
            if (res.data.success) {
                setHolidays(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load holidays');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (h) => {
        setSelectedHoliday(h);
        setFormData({
            id: h.id,
            holiday_name: h.holiday_name,
            holiday_date: h.holiday_date,
            holiday_type: h.holiday_type
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this holiday?")) return;
        try {
            const res = await axios.delete(`http://localhost/sales_manage/backend/api/attendance/holidays.php?id=${id}`);
            if (res.data.success) {
                toast.success('Holiday deleted');
                fetchHolidays();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to delete holiday');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://localhost/sales_manage/backend/api/attendance/holidays.php`, formData);
            if (res.data.success) {
                toast.success(res.data.message);
                setIsModalOpen(false);
                fetchHolidays();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to save holiday');
        }
    };

    const openNewForm = () => {
        setSelectedHoliday(null);
        setFormData({ id: '', holiday_name: '', holiday_date: '', holiday_type: 'Public' });
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Holiday Management</h1>
                    <p className="text-slate-500">Configure company and public holidays</p>
                </div>
                <button
                    onClick={openNewForm}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 font-bold transition"
                >
                    <Plus size={18} />
                    Add Holiday
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Date</th>
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Holiday Name</th>
                                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Type</th>
                                <th className="py-4 px-6 font-semibold text-sm text-center text-slate-600 dark:text-slate-400 w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-500">Loading holidays...</td>
                                </tr>
                            ) : holidays.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-500 border-t border-slate-100 dark:border-slate-700/50">No holidays generated</td>
                                </tr>
                            ) : (
                                holidays.map((h, idx) => (
                                    <motion.tr
                                        key={h.id}
                                        className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition group"
                                    >
                                        <td className="py-4 px-6 font-medium text-slate-800 dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                                    <Calendar size={18} />
                                                </div>
                                                <span>{new Date(h.holiday_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                                            {h.holiday_name}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${h.holiday_type === 'Public' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                                }`}>
                                                {h.holiday_type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(h)}
                                                    className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl transition"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(h.id)}
                                                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 rounded-xl transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                    <Umbrella className="text-indigo-500" />
                                    {selectedHoliday ? 'Edit Holiday' : 'Add New Holiday'}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"
                                >
                                    <X />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6">
                                <div className="grid gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Holiday Date</label>
                                        <div className="relative">
                                            <CalendarHeart className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                type="date"
                                                required
                                                value={formData.holiday_date}
                                                onChange={(e) => setFormData({ ...formData, holiday_date: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Holiday Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Diwali / Christmas"
                                            value={formData.holiday_name}
                                            onChange={(e) => setFormData({ ...formData, holiday_name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Holiday Type</label>
                                        <select
                                            value={formData.holiday_type}
                                            onChange={(e) => setFormData({ ...formData, holiday_type: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
                                        >
                                            <option value="Public">Public Holiday</option>
                                            <option value="Company">Company Holiday</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        Save Holiday
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HolidaySettings;
