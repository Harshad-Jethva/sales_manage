import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Search, Filter, Calendar, FileText, ArrowUpDown } from 'lucide-react';
import './CashHistory.css';

const CashHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        counter: '',
        user_id: ''
    });

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/cash_handover.php?${queryParams}`, {
                headers: { Authorization: `Bearer ${user.session_token}` }
            });
            if (response.data.success) {
                setHistory(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch history");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [filters]);

    return (
        <div className="history-container">
            <div className="history-header">
                <div className="header-info">
                    <h1>Cash Handover History</h1>
                    <p>Track daily cash counts and reconciliations across all panels</p>
                </div>

                <div className="filters-row">
                    <div className="filter-group">
                        <label>Date From</label>
                        <input
                            type="date"
                            className="filter-input"
                            value={filters.date_from}
                            onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Date To</label>
                        <input
                            type="date"
                            className="filter-input"
                            value={filters.date_to}
                            onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Panel / Counter</label>
                        <select
                            className="filter-input"
                            value={filters.counter}
                            onChange={(e) => setFilters(prev => ({ ...prev, counter: e.target.value }))}
                        >
                            <option value="">All Panels</option>
                            <option value="POS">POS</option>
                            <option value="Admin">Admin</option>
                            <option value="Warehouse">Warehouse</option>
                            <option value="Accounts">Accounts</option>
                            <option value="Salesman">Salesman</option>
                        </select>
                    </div>
                    <button className="refresh-btn" onClick={fetchHistory}>
                        <Search size={18} />
                        Filter
                    </button>
                </div>
            </div>

            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Counter</th>
                            <th>Total Cash</th>
                            <th>Expected</th>
                            <th>Difference</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-8">Loading history...</td></tr>
                        ) : history.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-8 text-white/40 italic">No records found</td></tr>
                        ) : history.map((record) => (
                            <tr key={record.id} className="history-row">
                                <td className="date-cell">
                                    <Calendar size={14} className="text-indigo-400 mr-2" />
                                    {new Date(record.handover_date).toLocaleDateString()}
                                </td>
                                <td>
                                    <div className="user-blob">
                                        <div className="avatar">{record.user_display_name[0]}</div>
                                        <span>{record.user_display_name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`counter-badge ${record.counter_name.toLowerCase()}`}>
                                        {record.counter_name}
                                    </span>
                                </td>
                                <td className="amount-cell">₹ {parseFloat(record.total_cash).toLocaleString()}</td>
                                <td className="amount-cell">₹ {parseFloat(record.expected_balance).toLocaleString()}</td>
                                <td className={`amount-cell difference ${parseFloat(record.difference) < 0 ? 'negative' : parseFloat(record.difference) > 0 ? 'positive' : ''}`}>
                                    ₹ {parseFloat(record.difference).toLocaleString()}
                                </td>
                                <td>
                                    {parseFloat(record.difference) === 0 ? (
                                        <span className="status-badge success">Matched</span>
                                    ) : (
                                        <span className="status-badge warning">Mismatch</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CashHistory;
