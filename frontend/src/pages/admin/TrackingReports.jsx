import React, { useState, useEffect } from 'react';
import { FileDown, Calendar, Search, Map as MapIcon, Loader2, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';

const TrackingReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('http://localhost/sales_manage/backend/api/gps.php?action=get_reports');
                const data = await res.json();
                if (data.success) {
                    setReports(data.data);
                } else {
                    toast.error(data.message || "Failed to load reports");
                }
            } catch (err) {
                toast.error("Network error");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = reports.filter(report => {
        const matchName = report.salesman_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDate = dateFilter ? report.route_date === dateFilter : true;
        return matchName && matchDate;
    });

    const exportPDF = () => {
        const doc = new jsPDF('landscape');
        doc.text("Salesman Tracking History Report", 14, 15);

        const tableColumn = ["Salesman", "Route Date", "Start Time", "End Time", "Working Hours", "Distance"];
        const tableRows = [];

        filteredReports.forEach(r => {
            const rowData = [
                r.salesman_name,
                r.route_date,
                new Date(r.start_time).toLocaleTimeString(),
                new Date(r.end_time).toLocaleTimeString(),
                r.working_hours,
                r.distance
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });
        doc.save(`Tracking_Report_${new Date().toLocaleDateString()}.pdf`);
        toast.success("PDF Exported Successfully");
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredReports.map(r => ({
            "Salesman Name": r.salesman_name,
            "Route Date": r.route_date,
            "Start Time": new Date(r.start_time).toLocaleTimeString(),
            "End Time": new Date(r.end_time).toLocaleTimeString(),
            "Working Hours": r.working_hours,
            "Total Distance Travelled": r.distance
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tracking Reports");
        XLSX.writeFile(workbook, `Tracking_Reports_${new Date().toLocaleDateString()}.xlsx`);
        toast.success("Excel Exported Successfully");
    };

    return (
        <div className="flex flex-col h-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MapIcon className="text-indigo-400 w-6 h-6" />
                        Salesman Tracking Reports
                    </h2>
                    <p className="text-white/60 text-sm">Review historical tracking data and movement</p>
                </div>

                <div className="flex gap-2 text-sm">
                    <button onClick={exportPDF} className="flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl transition-all shadow-lg border border-red-500/30">
                        <FileDown className="w-4 h-4" /> PDF
                    </button>
                    <button onClick={exportExcel} className="flex items-center gap-2 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white px-4 py-2 rounded-xl transition-all shadow-lg border border-green-500/30">
                        <FileDown className="w-4 h-4" /> Excel
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-white/40 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search Salesman..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-indigo-500 outline-none"
                    />
                </div>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-white/40 w-5 h-5 pointer-events-none" />
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="bg-black/40 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-indigo-500 outline-none"
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
                {dateFilter && (
                    <button onClick={() => setDateFilter('')} className="bg-white/10 text-white px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all">Clear Filter</button>
                )}
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-white/10 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/10 sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-white">Salesman</th>
                            <th className="p-4 text-sm font-semibold text-white">Date</th>
                            <th className="p-4 text-sm font-semibold text-white">Route Times</th>
                            <th className="p-4 text-sm font-semibold text-white">Start / End Location</th>
                            <th className="p-4 text-sm font-semibold text-white">Working Hours</th>
                            <th className="p-4 text-sm font-semibold text-white">Total Distance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-white/50">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                        <span>Analyzing Tracking Data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-white/50">No tracking reports found</td>
                            </tr>
                        ) : (
                            filteredReports.map((r, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{r.salesman_name}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-white/80">{r.route_date}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs text-white/60">
                                            <div className="flex gap-1 items-center"><span className="text-green-400 w-8">Start:</span> <span className="text-white bg-black/30 px-1 rounded">{new Date(r.start_time).toLocaleTimeString()}</span></div>
                                            <div className="flex gap-1 items-center mt-1"><span className="text-orange-400 w-8">End:</span> <span className="text-white bg-black/30 px-1 rounded">{new Date(r.end_time).toLocaleTimeString()}</span></div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs text-white/60 space-y-1">
                                            <div className="flex items-center gap-1.5"><Navigation className="w-3 h-3 text-green-500" /> {parseFloat(r.start_lat).toFixed(4)}, {parseFloat(r.start_lng).toFixed(4)}</div>
                                            <div className="flex items-center gap-1.5"><Navigation className="w-3 h-3 text-orange-500" /> {parseFloat(r.end_lat).toFixed(4)}, {parseFloat(r.end_lng).toFixed(4)}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full inline-block text-xs font-semibold">
                                            {r.working_hours}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-white text-lg">
                                            {r.distance}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrackingReports;
