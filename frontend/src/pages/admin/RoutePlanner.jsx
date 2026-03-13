import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Users, MapPin, Calendar, Search, CheckSquare, Save, Printer,
    Truck, ChevronDown, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RoutePlanner = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Route ID for editing
    const editingRouteId = location.state?.routeId || null;

    // Data States
    const [salesmen, setSalesmen] = useState([]);
    const [areas, setAreas] = useState([]);
    const [clients, setClients] = useState([]);

    // Form States
    const [selectedSalesman, setSelectedSalesman] = useState('');
    const [routeDate, setRouteDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedClients, setSelectedClients] = useState([]); // Persistent list of all selected clients across different areas
    const [areaSearch, setAreaSearch] = useState('');
    const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);

    // UI States
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            await fetchSalesmen();
            await fetchAreas();

            if (editingRouteId) {
                await fetchRouteDetails(editingRouteId);
            }
            setIsInitialLoad(false);
        };
        initialize();
    }, [editingRouteId]);

    useEffect(() => {
        if (selectedArea) {
            fetchClients();
        } else {
            setClients([]);
        }
    }, [selectedArea]);

    const fetchSalesmen = async () => {
        try {
            const { data } = await axios.get('http://localhost/sales_manage/backend/api/users.php?role=salesman');
            if (data.success) {
                setSalesmen(data.data);
            }
        } catch (error) {
            toast.error('Failed to load salesmen');
        }
    };

    const fetchAreas = async () => {
        try {
            const { data } = await axios.get('http://localhost/sales_manage/backend/api/route_planner.php?action=get_areas');
            if (data.success) {
                setAreas(data.data);
            }
        } catch (error) {
            toast.error('Failed to load areas');
        }
    };

    const fetchRouteDetails = async (routeId) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost/sales_manage/backend/api/route_planner.php?action=get_route_details&route_id=${routeId}`);
            if (data.success) {
                const { plan, clients } = data.data;
                setSelectedSalesman(plan.salesman_id.toString());
                setRouteDate(plan.route_date);
                setSelectedClients(clients);
                toast.success('Route details loaded for editing');
            }
        } catch (error) {
            toast.error('Failed to load route details');
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost/sales_manage/backend/api/route_planner.php?action=get_clients&areas=${encodeURIComponent(selectedArea)}`);
            if (data.success) {
                setClients(data.data);
            }
        } catch (error) {
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    const handleAreaSelect = (area) => {
        setSelectedArea(area);
        setAreaSearch('');
        setIsAreaDropdownOpen(false);
    };

    const handleClientToggle = (client) => {
        setSelectedClients(prev => {
            const exists = prev.find(c => c.client_id === client.client_id);
            if (exists) {
                return prev.filter(c => c.client_id !== client.client_id);
            } else {
                return [...prev, client];
            }
        });
    };

    const toggleAllCurrentClients = () => {
        const currentVisibleIds = clients.map(c => c.client_id);
        const selectedVisibleCount = selectedClients.filter(sc => currentVisibleIds.includes(sc.client_id)).length;

        if (selectedVisibleCount === clients.length) {
            setSelectedClients(prev => prev.filter(sc => !currentVisibleIds.includes(sc.client_id)));
        } else {
            setSelectedClients(prev => {
                const otherSelected = prev.filter(sc => !currentVisibleIds.includes(sc.client_id));
                return [...otherSelected, ...clients];
            });
        }
    };

    const removeSelectedClient = (clientId) => {
        setSelectedClients(prev => prev.filter(c => c.client_id !== clientId));
    };

    const selectedSalesmanObj = salesmen.find(s => s.id.toString() === selectedSalesman);

    const generatePDF = (mode = 'save', routeId = null, saveCallback = null) => {
        if (!selectedSalesmanObj || !routeDate) {
            toast.error('Please select a salesman and date');
            return;
        }

        const clientsToInclude = selectedClients;
        if (clientsToInclude.length === 0) {
            toast.error('Please select at least one client');
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // --- 1. PREMIUM HEADER ---
        // Header Background
        doc.setFillColor(79, 70, 229); // Indigo-600
        doc.rect(0, 0, pageWidth, 45, 'F');

        // Header Text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('ROUTE PLAN', pageWidth / 2, 22, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('ERP SYSTEM AUTO-GENERATED DISPATCH REPORT', pageWidth / 2, 30, { align: 'center' });

        // --- 2. CONFIGURATION BOX ---
        // Top Card Shadow/Outline Effect
        doc.setDrawColor(241, 245, 249);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(12, 38, pageWidth - 24, 30, 3, 3, 'FD');

        doc.setTextColor(30, 41, 59); // Slate-800
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('SALESMAN DETAILS', 18, 47);
        doc.text('ROUTE OVERVIEW', pageWidth / 2 + 5, 47);

        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.line(18, 49, pageWidth / 2 - 10, 49);
        doc.line(pageWidth / 2 + 5, 49, pageWidth - 18, 49);

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Name: ${selectedSalesmanObj.name}`, 18, 55);
        doc.text(`Phone: ${selectedSalesmanObj.mobile_number || 'N/A'}`, 18, 61);

        doc.text(`Target Date: ${new Date(routeDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth / 2 + 5, 55);
        doc.text(`Total Stops: ${clientsToInclude.length} Clients`, pageWidth / 2 + 5, 61);

        // --- 3. DATA PREPARATION ---
        const tableData = [];
        let grandTotalOutstanding = 0;

        clientsToInclude.forEach((c, index) => {
            const outstandingNum = parseFloat(c.outstanding_amount || 0);
            grandTotalOutstanding += outstandingNum;

            const outstandingStr = outstandingNum.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            // Primary Row
            tableData.push([
                { content: (index + 1).toString(), styles: { halign: 'center', fontStyle: 'bold' } },
                { content: `ID: ${c.client_id}` },
                {
                    content: `${c.client_name}\nZone: ${c.area_name}\nAddr: ${c.address ? c.address.substring(0, 70) + (c.address.length > 70 ? '...' : '') : 'N/A'}`,
                    styles: { cellPadding: { top: 4, bottom: 4, left: 4, right: 4 } }
                },
                { content: `Rs. ${outstandingStr}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [225, 29, 72] } },
                { content: c.pending_bills_count > 0 ? `${c.pending_bills_count} Active Bills` : 'Clear History', styles: { halign: 'center' } }
            ]);

            // Nested Bill Details (if any)
            if (c.pending_bills_count > 0) {
                const billHeader = ["BILL DATE", "BILL NUMBER", "PENDING AMOUNT"];
                const billRows = c.pending_bills_list.map(b => [
                    new Date(b.bill_date).toLocaleDateString('en-GB'),
                    b.bill_number,
                    `Rs.  ${parseFloat(b.pending_amount).toLocaleString('en-IN')}`
                ]);

                // Create a formatted string representation for the nested row
                let nestedContent = "PENDING BILL BREAKDOWN:\n";
                nestedContent += "------------------------------------------------------------------------------------------\n";
                nestedContent += "DATE        | BILL NO         | AMOUNT\n";
                nestedContent += "------------------------------------------------------------------------------------------\n";

                c.pending_bills_list.forEach(b => {
                    const date = new Date(b.bill_date).toLocaleDateString('en-GB').padEnd(12);
                    const bnum = b.bill_number.padEnd(16);
                    const bamt = "Rs." + parseFloat(b.pending_amount).toLocaleString('en-IN');
                    nestedContent += `${date} | ${bnum} | ${bamt}\n`;
                });

                tableData.push([{
                    content: nestedContent,
                    colSpan: 5,
                    styles: {
                        fillColor: [248, 250, 252],
                        textColor: [71, 85, 105],
                        fontSize: 8,
                        font: 'courier',
                        cellPadding: 4,
                        lineColor: [226, 232, 240],
                        lineWidth: 0.1
                    }
                }]);
            }
        });

        // --- 4. RENDER TABLE ---
        autoTable(doc, {
            startY: 75,
            head: [['SR.NO', 'CODE', 'CLIENT & ZONE INFORMATION', 'OUTSTANDING', 'STATUS']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [30, 41, 59], // Slate-800
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center',
                cellPadding: 4
            },
            styles: {
                fontSize: 9,
                valign: 'middle',
                lineColor: [226, 232, 240],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 75 },
                3: { cellWidth: 40 },
                4: { cellWidth: 35 }
            },
            alternateRowStyles: { fillColor: [252, 252, 253] },
            margin: { left: 12, right: 12 },
            didDrawPage: (data) => {
                // Footer per page
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // Slate-400
                doc.text(`Page ${data.pageNumber}`, pageWidth - 20, pageHeight - 10);
                doc.text('© HAB CREATION - SALES MANAGEMENT ERP', 12, pageHeight - 10);
            }
        });

        // --- 5. SUMMARY SECTION ---
        const finalY = doc.lastAutoTable.finalY + 10;
        if (finalY < pageHeight - 40) {
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(pageWidth - 92, finalY, 80, 25, 2, 2, 'FD');

            doc.setTextColor(71, 85, 105);
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.text('TOTAL COLLECTION TARGET', pageWidth - 86, finalY + 8);

            doc.setTextColor(225, 29, 72); // Rose-600
            doc.setFontSize(14);
            doc.text(`Rs. ${grandTotalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 86, finalY + 18);
        }

        // --- 6. OUTPUT ---
        const cleanName = selectedSalesmanObj.name.replace(/[^A-Za-z0-9]/g, '_');
        const fileName = `RoutePlan_${cleanName}_${routeDate}.pdf`;

        if (mode === 'preview') {
            doc.output('dataurlnewwindow');
        } else if (mode === 'download') {
            doc.save(fileName);
        } else if (mode === 'save') {
            const base64PDF = doc.output('datauristring');
            if (saveCallback) saveCallback(base64PDF);
        }
    };

    const handleSaveRoute = async () => {
        if (!selectedSalesman || !routeDate || selectedClients.length === 0) {
            toast.error('Please select salesman, date and clients');
            return;
        }

        setGenerating(true);
        try {
            const payload = {
                route_id: editingRouteId,
                salesman_id: parseInt(selectedSalesman),
                route_date: routeDate,
                clients: selectedClients
            };

            const action = editingRouteId ? 'update_route' : 'save_route';
            const res = await axios.post(`http://localhost/sales_manage/backend/api/route_planner.php?action=${action}`, payload);
            const data = res.data;

            if (data.success) {
                const routeId = editingRouteId || data.route_id;
                toast.success(editingRouteId ? 'Route plan updated!' : 'Route plan saved!');

                generatePDF('save', routeId, async (base64PDF) => {
                    const pdfPayload = {
                        route_id: routeId,
                        pdf_base64: base64PDF,
                        salesman_name: selectedSalesmanObj.name,
                        route_date: routeDate
                    };
                    try {
                        const pdfRes = await axios.post('http://localhost/sales_manage/backend/api/route_planner.php?action=save_route_pdf', pdfPayload);
                        if (pdfRes.data.success) {
                            const waRes = await axios.post('http://localhost/sales_manage/backend/api/route_planner.php?action=send_whatsapp', { route_id: routeId });
                            if (waRes.data.success) {
                                toast.success('Route Plan sent via WhatsApp!');
                            }
                        }
                    } catch (e) {
                        toast.error('Saved, but failed to process PDF/WhatsApp');
                    }
                });

                if (editingRouteId) {
                    navigate(location.pathname.replace('route-planner', 'route-history'));
                } else {
                    setSelectedArea(null);
                    setSelectedClients([]);
                    setClients([]);
                }

            } else {
                toast.error(data.message || 'Failed to save route plan');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving route');
        } finally {
            setGenerating(false);
        }
    };

    if (isInitialLoad && editingRouteId) {
        return (
            <div className="flex flex-col justify-center items-center h-[600px]">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-[2rem] animate-pulse"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-[2rem] border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] animate-pulse">Loading Route for Editing...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto animate-fade-in relative z-10">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <Truck className="w-8 h-8 text-white" />
                        </div>
                        Route <span className="text-indigo-400">{editingRouteId ? 'Editor' : 'Planner'}</span>
                    </h1>
                    <p className="text-slate-400 mt-3 max-w-2xl font-medium leading-relaxed">
                        {editingRouteId
                            ? `You are currently modifying Route Plan #${editingRouteId}. Update assignments, dates, or clients as needed.`
                            : 'Design strategic visit paths. Search by area, select multiple clients across different zones, and generate high-impact dispatch reports with one click.'
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-2xl">
                    <div className="px-5 py-2 text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Live Status</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${editingRouteId ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                            <span className="text-sm font-bold text-slate-200">{editingRouteId ? 'Update Mode Active' : 'System Ready'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                <div className="lg:col-span-4 space-y-6 relative z-10">
                    <div className="group bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all duration-700" />
                        <h3 className="font-black text-white mb-6 flex items-center text-sm uppercase tracking-widest">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 mr-4 border border-indigo-500/20">
                                <Calendar className="w-5 h-5" />
                            </div>
                            Core Configuration
                        </h3>
                        <div className="space-y-5">
                            <div className="relative group/field">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Assign Salesman</label>
                                <div className="relative">
                                    <Users className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-indigo-400 transition-colors" />
                                    <select
                                        className="w-full pl-11 pr-10 py-3.5 bg-slate-800/40 border border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all text-white appearance-none font-bold text-sm"
                                        value={selectedSalesman}
                                        onChange={(e) => setSelectedSalesman(e.target.value)}
                                    >
                                        <option value="" className="bg-slate-900">-- Select Agent --</option>
                                        {salesmen.map(s => (
                                            <option key={s.id} value={s.id} className="bg-slate-900 font-sans">{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="relative group/field">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Execution Date</label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-indigo-400 transition-colors" />
                                    <input
                                        type="date"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-800/40 border border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all text-white font-bold text-sm scheme-dark"
                                        value={routeDate}
                                        onChange={(e) => setRouteDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full -mr-16 -mt-16" />
                        <h3 className="font-black text-white mb-6 flex items-center text-sm uppercase tracking-widest">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 mr-4 border border-indigo-500/20">
                                <MapPin className="w-5 h-5" />
                            </div>
                            Target Zone
                        </h3>
                        <div className="relative mb-5">
                            <div className="relative group/search">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search specific area..."
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/40 border border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all text-sm text-white placeholder-slate-500 font-medium"
                                    value={areaSearch}
                                    onChange={(e) => {
                                        setAreaSearch(e.target.value);
                                        setIsAreaDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsAreaDropdownOpen(true)}
                                />
                            </div>
                            {isAreaDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsAreaDropdownOpen(false)} />
                                    <div className="absolute z-20 w-full mt-3 bg-slate-800/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-60 overflow-y-auto custom-scrollbar p-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                        {areas.filter(a => a.toLowerCase().includes(areaSearch.toLowerCase())).length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-10 h-10 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-500">
                                                    <Search size={18} />
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">No Zones Found</p>
                                            </div>
                                        ) : (
                                            areas.filter(a => a.toLowerCase().includes(areaSearch.toLowerCase())).map((area, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3.5 hover:bg-indigo-500 rounded-xl cursor-pointer transition-all text-sm text-slate-300 hover:text-white font-bold flex items-center gap-3 mb-1 last:mb-0"
                                                    onClick={() => handleAreaSelect(area)}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 group-hover:text-white transition-colors">
                                                        <MapPin size={14} />
                                                    </div>
                                                    {area}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        {selectedArea ? (
                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between group/pill hover:bg-indigo-500/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 text-white">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selected Zone</p>
                                        <p className="text-sm font-bold text-white">{selectedArea}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSelectedArea(null); setClients([]); }}
                                    className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="py-6 border-2 border-dashed border-slate-800 rounded-2xl px-4 text-center">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">Choose a Zone to Load clients</p>
                            </div>
                        )}
                    </div>

                    <div className="group bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 relative flex flex-col overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none z-20" />
                        <h3 className="font-black text-white mb-6 flex items-center justify-between text-sm uppercase tracking-widest">
                            <div className="flex items-center">
                                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 mr-4 border border-rose-500/20">
                                    <CheckSquare className="w-5 h-5" />
                                </div>
                                Selected Pool
                            </div>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white text-[11px] font-black shadow-lg shadow-rose-500/30">
                                {selectedClients.length}
                            </div>
                        </h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 min-h-[100px]">
                            {selectedClients.length === 0 ? (
                                <div className="text-center py-12 px-6">
                                    <div className="w-16 h-16 bg-slate-800/40 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 text-slate-600 border border-white/5">
                                        <Users size={32} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Clients in Pool</p>
                                    <p className="text-[10px] text-slate-600 mt-2">Select clients from the right panel to build your route.</p>
                                </div>
                            ) : (
                                selectedClients.map(client => (
                                    <div key={client.client_id} className="group/item flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-white/5 hover:border-rose-500/30 hover:bg-slate-800/60 transition-all animate-fade-in">
                                        <div className="min-width-0 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-xs text-rose-400 border border-white/5">
                                                {client.client_name.charAt(0)}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-black text-white truncate">{client.client_name}</p>
                                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5 mt-0.5">
                                                    <MapPin size={10} /> {client.area_name}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeSelectedClient(client.client_id)}
                                            className="w-8 h-8 rounded-xl bg-slate-900/50 flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover/item:opacity-100"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 h-full flex flex-col">
                    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/5 h-full flex flex-col relative z-0 overflow-hidden group/main hover:border-indigo-500/20 transition-all duration-500">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
                        <div className="p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-6 relative z-10 bg-slate-900/20 backdrop-blur-md">
                            <div className="flex items-center gap-5">
                                <div className={`p-4 ${editingRouteId ? 'bg-amber-500' : 'bg-indigo-500'} rounded-3xl shadow-xl shadow-indigo-500/20 text-white`}>
                                    <Users className="w-8 h-8" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-black text-2xl text-white tracking-tight leading-none mb-2">
                                        Client Selection
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            {clients.length === 0 ? "Waiting for zone selection" : `${clients.length} Total Targets Found`}
                                        </span>
                                        {selectedArea && (
                                            <span className="bg-indigo-500 text-white font-black text-[10px] px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">
                                                {selectedArea}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-800/40 p-2.5 rounded-3xl border border-white/5 shadow-inner">
                                <div className="flex items-center gap-3 px-2">
                                    {selectedClients.length > 0 && (
                                        <div className="flex flex-col items-end px-4 border-r border-white/10 group/stat">
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-0.5">Pool Size</span>
                                            <span className="text-2xl font-black text-white leading-none tracking-tighter group-hover/stat:scale-110 transition-transform">{selectedClients.length}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2.5">
                                    {editingRouteId && (
                                        <button
                                            onClick={() => navigate(location.pathname.replace('route-planner', 'route-history'))}
                                            className="h-12 px-6 bg-slate-700/50 text-slate-200 rounded-2xl hover:bg-slate-600 hover:text-white transition-all flex items-center text-xs font-black uppercase tracking-widest border border-white/5 group/btn shadow-xl"
                                        >
                                            <X className="w-4 h-4 mr-2.5" />
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={() => generatePDF('preview')}
                                        disabled={selectedClients.length === 0}
                                        className="h-12 px-6 bg-slate-700/50 text-slate-200 rounded-2xl hover:bg-slate-600 hover:text-white transition-all flex items-center text-xs font-black uppercase tracking-widest border border-white/5 disabled:opacity-20 disabled:cursor-not-allowed group/btn shadow-xl"
                                    >
                                        <Printer className="w-4 h-4 mr-2.5 group-hover/btn:scale-110 transition-transform" />
                                        Preview
                                    </button>
                                    <button
                                        onClick={handleSaveRoute}
                                        disabled={selectedClients.length === 0 || generating}
                                        className={`h-12 px-8 ${editingRouteId ? 'bg-amber-500' : 'bg-indigo-500'} text-white rounded-2xl hover:opacity-90 transition-all flex items-center text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(245,158,11,0.4)] group/save`}
                                    >
                                        {generating ? (
                                            <div className="w-4 h-4 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                        ) : editingRouteId ? (
                                            <RefreshCw className="w-4 h-4 mr-3 group-hover/save:rotate-180 transition-all duration-700" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-3 group-hover/save:rotate-12 transition-transform" />
                                        )}
                                        {generating ? "Initializing..." : editingRouteId ? "Update Route" : "Save Route"}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 flex-1 overflow-auto bg-slate-900/10 custom-scrollbar relative">
                            {loading ? (
                                <div className="flex flex-col justify-center items-center h-[400px]">
                                    <div className="relative w-20 h-20 mb-6">
                                        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-[2rem] animate-pulse"></div>
                                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-[2rem] border-t-transparent animate-spin"></div>
                                    </div>
                                    <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] animate-pulse">Fetching Clients</p>
                                </div>
                            ) : clients.length === 0 ? (
                                <div className="h-full flex flex-col justify-center items-center py-20 bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-white/5 group/empty transition-all duration-500 overflow-hidden">
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse transition-all duration-1000 group-hover/empty:bg-indigo-500/40" />
                                        <div className="relative w-32 h-32 bg-slate-900/80 rounded-[2.5rem] border border-white/10 flex items-center justify-center text-slate-700 shadow-2xl transition-transform duration-700 group-hover/empty:scale-110 group-hover/empty:rotate-3">
                                            <MapPin className="w-16 h-16 group-hover/empty:text-indigo-500 transition-colors duration-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight mb-3">No Active Zone Selected</h3>
                                    <p className="text-slate-500 max-w-sm text-center font-bold text-sm leading-relaxed px-10">
                                        Search and select a target zone from the left command panel to view and assign local clients.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-8 bg-slate-800/30 p-4 rounded-3xl border border-white/5 shadow-inner backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Current Filter</p>
                                                <p className="text-sm font-black text-white">{selectedArea}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={toggleAllCurrentClients}
                                            className="h-11 px-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all flex items-center text-xs font-black uppercase tracking-widest border border-white/5 group/toggle"
                                        >
                                            <CheckSquare className="w-4 h-4 mr-3 text-indigo-400 group-hover/toggle:scale-110 transition-transform" />
                                            {selectedClients.filter(sc => clients.map(c => c.client_id).includes(sc.client_id)).length === clients.length ? 'Deselect Zone' : 'Select Complete Zone'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5">
                                        {clients.map(client => {
                                            const isSelected = selectedClients.some(c => c.client_id === client.client_id);
                                            return (
                                                <div
                                                    key={client.client_id}
                                                    className={`group/card relative bg-slate-800/40 rounded-[2rem] border-2 p-6 transition-all duration-500 cursor-pointer overflow-hidden ${isSelected ? 'border-indigo-500 bg-indigo-500/[0.03] shadow-[0_20px_40px_rgba(99,102,241,0.1)]' : 'border-white/5 hover:border-white/20 hover:bg-slate-800/80 hover:scale-[1.01]'}`}
                                                    onClick={() => handleClientToggle(client)}
                                                >
                                                    <div className={`absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[80px] transition-all duration-700 ${isSelected ? 'bg-indigo-500/20' : 'bg-transparent group-hover/card:bg-white/5'}`} />
                                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className="relative">
                                                                <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-2xl font-black transition-all duration-500 border-2 ${isSelected ? 'bg-indigo-500 text-white border-white/20 shadow-xl shadow-indigo-500/40' : 'bg-slate-900 text-slate-400 border-white/5'}`}>
                                                                    {client.client_name.charAt(0)}
                                                                </div>
                                                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-900 text-white flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-indigo-500 scale-110' : 'bg-slate-800 scale-0 opacity-0'}`}>
                                                                    <CheckSquare size={12} weight="bold" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h4 className="font-black text-xl text-white tracking-tight leading-none group-hover/card:text-indigo-400 transition-colors">{client.client_name}</h4>
                                                                    <span className="text-[10px] font-black text-slate-500 bg-black/40 px-2.5 py-1 rounded-full border border-white/5 tracking-widest uppercase">ID #{client.client_id}</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-3 items-center">
                                                                    <span className="flex items-center bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                                        <MapPin className="w-3 h-3 mr-2" /> {client.area_name}
                                                                    </span>
                                                                    {client.mobile_number && (
                                                                        <span className="text-[11px] font-bold text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-white/5">📱 {client.mobile_number}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-end flex-col justify-center">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Outstanding</p>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-sm font-black text-rose-500/50">₹</span>
                                                                <span className="text-3xl font-black text-rose-500 tracking-tighter shadow-rose-500/20 drop-shadow-lg">{parseFloat(client.outstanding_amount).toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {client.pending_bills_count > 0 && (
                                                        <div className={`mt-6 pt-6 border-t transition-colors duration-500 ${isSelected ? 'border-indigo-500/20' : 'border-white/5'}`}>
                                                            <div className="flex items-center justify-between mb-4">
                                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Ledgers ({client.pending_bills_count})</p>
                                                                <div className="h-[2px] flex-1 mx-6 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                                                {client.pending_bills_list.slice(0, 3).map((bill, i) => (
                                                                    <div key={i} className="group/bill bg-slate-900/60 rounded-[1.25rem] p-4 flex justify-between items-center border border-white/5 hover:border-indigo-500/30 transition-all duration-300">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="font-black text-indigo-400 text-xs tracking-tight">{bill.bill_number}</span>
                                                                            <span className="text-slate-600 font-bold text-[10px] uppercase">{new Date(bill.bill_date).toLocaleDateString()}</span>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span className="text-rose-400 font-black text-sm block">₹{parseFloat(bill.pending_amount).toLocaleString('en-IN')}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoutePlanner;
