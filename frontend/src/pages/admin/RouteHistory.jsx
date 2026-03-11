import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Printer, Download, MessageCircle, Calendar, MapPin, Users, Filter, X, Edit2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const RouteHistory = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchRoutes();
    }, [search]);

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost/sales_manage/backend/api/route_planner.php?action=get_routes&search=${encodeURIComponent(search)}`);
            if (data.status === 'success') {
                setRoutes(data.data);
            }
        } catch (error) {
            toast.error('Failed to load route history');
        } finally {
            setLoading(false);
        }
    };

    const deleteRoute = async (routeId) => {
        if (!window.confirm("Are you sure you want to delete this route plan?")) return;

        try {
            const { data } = await axios.post('http://localhost/sales_manage/backend/api/route_planner.php?action=delete_route', { route_id: routeId });
            if (data.status === 'success') {
                toast.success('Route deleted successfully');
                fetchRoutes();
            } else {
                toast.error(data.message || 'Error deleting route');
            }
        } catch (error) {
            toast.error('Failed to delete route');
        }
    };

    const reSendWhatsApp = async (routeId) => {
        try {
            const { data } = await axios.post('http://localhost/sales_manage/backend/api/route_planner.php?action=send_whatsapp', { route_id: routeId });
            if (data.status === 'success') {
                toast.success(data.message);
                fetchRoutes(); // refresh status
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to send WhatsApp');
        }
    };

    const downloadRoutePDF = async (routeId, fileName) => {
        try {
            const { data } = await axios.get(`http://localhost/sales_manage/backend/api/route_planner.php?action=get_route_details&route_id=${routeId}`);
            if (data.status === 'success') {
                const { plan, clients } = data.data;

                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.width;

                // Header
                doc.setFontSize(20);
                doc.setTextColor(30, 41, 59);
                doc.setFont(undefined, 'bold');
                doc.text('ROUTE PLAN', pageWidth / 2, 20, { align: 'center' });

                doc.setFontSize(11);
                doc.setFont(undefined, 'normal');
                doc.text(`Salesman: ${plan.salesman_name}`, 14, 35);
                doc.text(`Contact: ${plan.mobile_number || 'N/A'}`, 14, 42);
                doc.text(`Route Date: ${new Date(plan.route_date).toLocaleDateString()}`, 14, 49);
                doc.text(`Total Clients: ${clients.length}`, pageWidth - 14, 35, { align: 'right' });

                // Table
                const tableData = [];
                clients.forEach((c, index) => {
                    const outstanding = parseFloat(c.outstanding_amount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
                    tableData.push([
                        index + 1,
                        c.client_id,
                        `${c.client_name}\nArea: ${c.area_name}\nContact: ${c.mobile_number || 'N/A'}\nAddress: ${c.address ? (c.address.substring(0, 80) + (c.address.length > 80 ? '...' : '')) : 'N/A'}`,
                        outstanding,
                        c.pending_bills_count > 0 ? `${c.pending_bills_count} Bills\nPending` : 'No Bills'
                    ]);

                    if (c.pending_bills_count > 0) {
                        let billHeader = "   DATE         |   BILL NO.      |   PENDING AMOUNT";
                        let billRows = c.pending_bills_list.map(b => {
                            const bDate = new Date(b.bill_date).toLocaleDateString();
                            const bNum = b.bill_number.padEnd(15);
                            const bAmt = "Rs." + parseFloat(b.pending_amount).toLocaleString('en-IN');
                            return `${bDate.padEnd(15)} | ${bNum} | ${bAmt}`;
                        }).join('\n');

                        tableData.push([{
                            content: `BILL DETAILS:\n${billHeader}\n------------------------------------------------------------\n${billRows}`,
                            colSpan: 5,
                            styles: { fillColor: [240, 244, 250], textColor: [47, 55, 71], fontSize: 8, fontStyle: 'bold', font: 'courier' }
                        }]);
                    }
                });

                autoTable(doc, {
                    startY: 55,
                    head: [['Sr.', 'ID', 'Client Details (Name, Area, Contact, Address)', 'Total Outstanding', 'Status']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [79, 70, 229], fontSize: 10, halign: 'center' },
                    styles: { fontSize: 9, cellPadding: 4, valign: 'middle' },
                    columnStyles: {
                        0: { halign: 'center', cellWidth: 10 },
                        1: { halign: 'center', cellWidth: 15 },
                        2: { cellWidth: 90 },
                        3: { halign: 'right', cellWidth: 40, fontStyle: 'bold', textColor: [225, 29, 72] },
                        4: { halign: 'center', cellWidth: 35 }
                    },
                    alternateRowStyles: { fillColor: [250, 250, 252] }
                });

                const docHeight = doc.internal.pageSize.height;
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Generated on ${new Date().toLocaleString()}`, 14, docHeight - 10);
                doc.text(`** Salesman Route Planner Report **`, pageWidth / 2, docHeight - 10, { align: 'center' });

                doc.save(fileName || `RoutePlan_${plan.salesman_name}_${plan.route_date}.pdf`);
            } else {
                toast.error(data.message || 'Failed to generate PDF');
            }
        } catch (e) {
            toast.error('Error generating PDF');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Route Plan History</h1>
                    <p className="text-slate-400 mt-2">View generated route plans and dispatch statuses.</p>
                </div>

                <div className="flex bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all w-full md:w-auto">
                    <div className="pl-3 py-2.5 flex items-center justify-center text-slate-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        className="w-full md:w-64 py-2.5 px-3 outline-none text-sm text-white bg-transparent placeholder-slate-500"
                        placeholder="Search by Salesman or Date..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className="pr-3 flex items-center justify-center text-slate-400 hover:text-slate-600"
                            onClick={() => setSearch('')}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-300 text-xs uppercase tracking-wider font-bold border-b border-slate-700/50">
                                <th className="px-6 py-4">Route ID</th>
                                <th className="px-6 py-4">Salesman</th>
                                <th className="px-6 py-4">Route Date</th>
                                <th className="px-6 py-4">Clients</th>
                                <th className="px-6 py-4">Completion Status</th>
                                <th className="px-6 py-4">WhatsApp Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 text-sm bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
                                        <span className="text-slate-400">Loading routes...</span>
                                    </td>
                                </tr>
                            ) : routes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-slate-500">
                                        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                        <p className="text-slate-400">No route history found</p>
                                    </td>
                                </tr>
                            ) : (
                                routes.map((route) => (
                                    <tr key={route.route_id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-300">
                                            <span className="bg-slate-900/50 border border-slate-700/50 px-2.5 py-1 rounded-lg text-xs">#{route.route_id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-base">{route.salesman_name}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-0.5">📱 {route.salesman_phone || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-slate-300 bg-slate-800/50 w-fit px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs font-semibold">
                                                <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                                                {new Date(route.route_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs border border-indigo-500/20">
                                                <Users className="w-3.5 h-3.5 mr-1.5" />
                                                {route.client_count} Clients
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-xs font-bold w-32">
                                                    <span className="text-emerald-400">{route.visited_count} Visited</span>
                                                    <span className="text-rose-400">{route.skipped_count} Skipped</span>
                                                </div>
                                                <div className="w-32 h-2 rounded-full bg-slate-800 overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${route.client_count > 0 ? (route.visited_count / route.client_count) * 100 : 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-0.5">
                                                    {route.client_count > 0 ? Math.round(((route.visited_count + route.skipped_count) / route.client_count) * 100) : 0}% Completed
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center text-xs font-bold px-3 py-1.5 flex-row gap-1.5 border rounded-lg ${route.whatsapp_status === 'Sent' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                                                {route.whatsapp_status === 'Sent' ? "Sent" : "Failed / Pending"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-3">
                                                <button
                                                    title="Edit Route"
                                                    onClick={() => navigate(location.pathname.replace('route-history', 'route-planner'), { state: { routeId: route.route_id } })}
                                                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 rounded-xl transition-colors border border-transparent hover:border-slate-700/50"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    title="Download Route PDF"
                                                    onClick={() => downloadRoutePDF(route.route_id, `RoutePlan_${route.salesman_name}_${route.route_date}.pdf`)}
                                                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 rounded-xl transition-colors border border-transparent hover:border-slate-700/50"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    title="Re-send WhatsApp"
                                                    onClick={() => reSendWhatsApp(route.route_id)}
                                                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 rounded-xl transition-colors border border-transparent hover:border-slate-700/50"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    title="Delete Route"
                                                    onClick={() => deleteRoute(route.route_id)}
                                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RouteHistory;
