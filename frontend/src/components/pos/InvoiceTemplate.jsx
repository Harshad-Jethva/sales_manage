import React from 'react';

const InvoiceTemplate = ({ bill, isHistoryView = false }) => {
    if (!bill) return null;

    // Helper functions for GST breakdown
    const gstBreakdown = {};
    let totalTaxable = 0;

    // Group by GST
    (bill.cart || []).forEach(item => {
        const gst = parseFloat(item.gst_percent || 18);
        const qty = parseFloat(item.qty || 1);
        const rate = parseFloat(item.price || 0);
        const discP = parseFloat(item.discountPercent || 0);
        const netRate = rate * (1 - discP / 100);
        const taxable = netRate * qty;

        const taxAmt = taxable * (gst / 100);

        if (!gstBreakdown[gst]) {
            gstBreakdown[gst] = { basic: 0, sgst: 0, cgst: 0, igst: 0 };
        }
        gstBreakdown[gst].basic += taxable;
        gstBreakdown[gst].sgst += taxAmt / 2;
        gstBreakdown[gst].cgst += taxAmt / 2;

        totalTaxable += taxable;
    });

    const breakdownEntries = Object.entries(gstBreakdown).map(([gst, data]) => ({
        gst: parseFloat(gst),
        ...data
    }));

    if (breakdownEntries.length === 0) {
        // Fallback dummy row for display if cart is empty
        breakdownEntries.push({ gst: 0, basic: 0, sgst: 0, cgst: 0, igst: 0 });
    }

    // Fill up empty lines to make the table take up space
    const minRows = 17;
    const cartItems = bill.cart || [];
    const emptyRows = Math.max(0, minRows - cartItems.length);

    // Date formatting
    const isDateValid = (d) => d instanceof Date && !isNaN(d);
    const bDate = bill.billDate ? new Date(bill.billDate) : new Date();
    const formattedDate = isDateValid(bDate) ? bDate.toLocaleDateString('en-GB') : '';

    const cDate = bill.created_at ? new Date(bill.created_at) : new Date();
    const formattedTime = isDateValid(cDate) ? cDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) : '';

    const colWidths = ['w-[5%]', 'w-[43%]', 'w-[8%]', 'w-[5%]', 'w-[7%]', 'w-[8%]', 'w-[8%]', 'w-[6%]', 'w-[10%]'];

    const finalTotal = parseFloat(bill.finalTotal || 0);
    const netAmount = Math.round(finalTotal);
    const roundOff = netAmount - finalTotal;

    return (
        <div id={isHistoryView ? "history-invoice" : "invoice-print"} className={`${isHistoryView ? 'flex' : 'hidden print:flex'} flex-col bg-white text-black font-sans mx-auto box-border w-full h-full overflow-hidden leading-tight`}>
            {/* Outline Border of the entire Invoice */}
            <div className="border-[2px] border-black flex flex-col flex-1 h-full w-full">

                {/* 1. Header Row (Logo + Company Info) */}
                <div className="flex border-b-[2px] border-black relative shrink-0 pb-1">
                    {/* Absolute texts top right */}
                    <div className="absolute top-1 right-2 text-right">
                        <div className="text-[9px] font-extrabold tracking-tight uppercase">YOUR ORDER IS BLESSING, THANK YOU.</div>
                        <div className="text-[9px] font-semibold text-right mt-[2px]">Original / Duplicate</div>
                    </div>
                    <div className="absolute bottom-1 right-2">
                        <div className="text-[10px] font-extrabold tracking-wider uppercase">CASH BILL</div>
                    </div>

                    {/* Left Logo */}
                    <div className="w-[30%] flex flex-col items-center justify-start px-2 pt-0 mt-[-4px]">
                        <div className="w-[90px] h-[45px] mb-1">
                            {/* Detailed Swan SVG */}
                            <svg viewBox="0 0 100 80" className="w-full h-full">
                                <path fill="#0f172a" d="M25 65 C15 65 5 50 10 30 C15 10 30 5 40 10 C45 12 40 20 35 25 C30 30 25 40 30 50 C35 60 30 65 25 65 Z" />
                                <path fill="#1e3a8a" d="M30 40 Q 60 0 95 10 Q 65 25 40 45 Z" />
                                <path fill="#3b82f6" d="M30 48 Q 65 15 95 28 Q 65 38 40 52 Z" />
                                <path fill="#60a5fa" d="M30 56 Q 60 35 90 45 Q 60 50 40 60 Z" />
                            </svg>
                        </div>
                        <div className="font-extrabold text-[20px] tracking-tight uppercase flex text-black">
                            <span>HAB CREATION</span>
                        </div>
                    </div>

                    {/* Center Text */}
                    <div className="flex-1 flex flex-col items-center justify-start text-center mr-[20%] text-black">
                        <h1 className="text-[28px] leading-none font-black tracking-widest mt-[-2px] uppercase text-black">HAB CREATION</h1>
                        <div className="text-[9px] leading-[11px] font-bold mt-1">
                            PLOT NO.4-5, PURANBAG IND., GAJERA CIRCLE, KATARGAM, SURAT.-395008<br />
                            PHONE : 98796-71136,    EMAIL ID: HABCREATION@GMAIL.COM
                        </div>
                        <div className="text-[11px] font-extrabold mt-1 tracking-wide uppercase">
                            GSTIN : 24AAUFB3398Q1ZH
                        </div>
                        <div className="text-[13px] font-extrabold uppercase tracking-wider mt-1">TAX INVOICE</div>
                    </div>
                </div>

                {/* 2. Customer & Bill Info Row */}
                <div className="flex border-b-[2px] border-black text-[10px] md:text-[11px] font-bold uppercase shrink-0">
                    {/* Left Customer Info */}
                    <div className="w-[70%] border-r-[2px] border-black flex flex-col">
                        <div className="flex w-full items-center border-b-[1.5px] border-black h-[1.75rem]">
                            <div className="w-[50px] px-1 pl-2">Name</div>
                            <div className="w-[10px] text-center">:</div>
                            <div className="flex-1 px-1 flex justify-between pr-4 items-center h-full">
                                <span className="font-extrabold text-[12px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[85%]">{bill.selectedClient?.name || 'CASH CUSTOMER'}</span>
                                <span className="font-extrabold">{bill.selectedClient?.client_id || ''}</span>
                            </div>
                        </div>
                        <div className="flex w-full py-[2px] flex-1">
                            <div className="w-[50px] px-1 pl-2">Add</div>
                            <div className="w-[10px] text-center">:</div>
                            <div className="flex-1 px-1 whitespace-pre-line leading-tight">
                                {bill.selectedClient?.address || 'LOCAL CUSTOMER'}<br />
                                {bill.selectedClient?.city || ''}
                            </div>
                        </div>
                        <div className="flex w-full mt-auto mb-[2px] items-end pb-1">
                            <div className="w-[50px] px-1 pl-2">GSTIN</div>
                            <div className="w-[10px] text-center">:</div>
                            <div className="w-[40%] px-1">{bill.selectedClient?.gstin || ''}</div>
                            <div className="flex-1 flex justify-end pr-3">
                                <div className="mr-2">PHONE</div>
                                <div className="mr-2">:</div>
                                <div>{bill.selectedClient?.phone || ''}</div>
                            </div>
                        </div>
                    </div>
                    {/* Right Bill Info */}
                    <div className="w-[30%] flex flex-col">
                        <div className="flex w-full border-b-[1.5px] border-black items-center h-1/3">
                            <div className="w-[35%] px-1 pl-2">BILL NO</div>
                            <div className="w-[10px] text-center">:</div>
                            <div className="flex-1 px-1 text-right pr-4">{bill.billNo}</div>
                        </div>
                        <div className="flex w-full border-b-[1.5px] border-black items-center h-1/3">
                            <div className="w-[35%] px-1 pl-2">BILL DT.</div>
                            <div className="w-[10px] text-center">:</div>
                            <div className="flex-1 px-1 text-right pr-4">{formattedDate}</div>
                        </div>
                        <div className="flex w-full items-center h-1/3">
                            <div className="w-[35%] px-1 pl-2">BILL TIME</div>
                            <div className="w-[10px] text-center">:</div>
                            <div className="flex-1 px-1 text-right pr-4">{formattedTime}</div>
                        </div>
                    </div>
                </div>

                {/* 3. Table Headers Row */}
                <div className="flex border-b-[2px] border-black text-[10px] md:text-[11px] font-extrabold text-center items-center py-[2px] bg-gray-100 shrink-0 uppercase tracking-tight">
                    <div className={`${colWidths[0]}`}>SR.</div>
                    <div className={`${colWidths[1]} text-left pl-2`}>DESCRIPTION</div>
                    <div className={`${colWidths[2]}`}>HSN</div>
                    <div className={`${colWidths[3]}`}>QTY</div>
                    <div className={`${colWidths[4]}`}>RATE</div>
                    <div className={`${colWidths[5]}`}>DISC.%</div>
                    <div className={`${colWidths[6]}`}>N.RATE</div>
                    <div className={`${colWidths[7]}`}>GST%</div>
                    <div className={`${colWidths[8]} pr-1 text-right`}>AMOUNT</div>
                </div>

                {/* 4. Table Body (Fills remaining height) */}
                <div className="relative flex-1 bg-white overflow-hidden text-[9px] md:text-[10px] font-extrabold leading-[12px] uppercase">
                    {/* Background Column Lines */}
                    <div className="absolute inset-0 flex pointer-events-none z-0 h-full border-b-[2px] border-black">
                        <div className={`${colWidths[0]} border-r-[2px] border-black h-full`}></div>
                        <div className={`${colWidths[1]} border-r-[2px] border-black h-full`}></div>
                        <div className={`${colWidths[2]} border-r-[2px] border-black h-full`}></div>
                        <div className={`${colWidths[3]} border-r-[2px] border-black h-full`}></div>
                        <div className={`${colWidths[4]} border-r-[2px] border-black h-full`}></div>
                        <div className={`${colWidths[5]} border-r-[2px] border-black h-full`}></div>
                        <div className={`${colWidths[6]} border-r-[2px] border-black h-full`}></div>
                        <div className={`${colWidths[7]} border-r-[2px] border-black h-full`}></div>
                        <div className={`${colWidths[8]} h-full`}></div>
                    </div>

                    {/* Actual Rows */}
                    <div className="relative z-10 w-full pt-1 pb-1">
                        {cartItems.map((item, idx) => {
                            const rate = parseFloat(item.price || 0);
                            const qty = parseFloat(item.qty || 1);
                            const discP = parseFloat(item.discountPercent || 0);
                            const nRate = rate * (1 - (discP / 100));
                            const gst = parseFloat(item.gst_percent || 18);
                            const amt = nRate * qty;

                            return (
                                <div key={idx} className="flex mb-[4px] items-start">
                                    <div className={`${colWidths[0]} text-center px-1`}>{idx + 1}</div>
                                    <div className={`${colWidths[1]} px-[4px] pr-2 break-words`}>{item.name}</div>
                                    <div className={`${colWidths[2]} text-center px-1`}>{item.sku || '960810'}</div>
                                    <div className={`${colWidths[3]} text-center px-1 text-[11px]`}>{qty}</div>
                                    <div className={`${colWidths[4]} text-right px-[2px]`}>{rate.toFixed(2)}</div>
                                    <div className={`${colWidths[5]} text-center px-[2px]`}>0+0+0+{(discP % 1 === 0 ? discP.toFixed(0) : discP.toFixed(1))}</div>
                                    <div className={`${colWidths[6]} text-right px-[2px]`}>{nRate.toFixed(2)}</div>
                                    <div className={`${colWidths[7]} text-center px-[2px]`}>{gst}%</div>
                                    <div className={`${colWidths[8]} pr-1 text-right font-mono text-[10px] md:text-[11px] tracking-tight`}>{amt.toFixed(4)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 5. Summary Top Headers */}
                <div className="flex border-t-[2px] border-b-[2px] border-black text-[10px] font-extrabold text-center items-center shrink-0 tracking-wide bg-gray-50 uppercase py-[1px]">
                    <div className="w-[45%] flex">
                        <div className="w-[15%]">GST%</div>
                        <div className="w-[20%]">BASIC</div>
                        <div className="w-[21.6%]">SGST</div>
                        <div className="w-[21.6%]">CGST</div>
                        <div className="w-[21.6%] border-r-[2px] border-black">IGST</div>
                    </div>
                    <div className="w-[30%] border-r-[2px] border-black p-1 text-center font-extrabold text-[12px]">
                        PAYMENT QR CODE
                    </div>
                    <div className="w-[25%] flex justify-between px-2 text-[11px]">
                        <span>BASIC :</span>
                        <span>{totalTaxable.toFixed(2)}</span>
                    </div>
                </div>

                {/* 6. Summary Values Row */}
                <div className="flex border-b-[2px] border-black text-[10px] font-extrabold shrink-0 uppercase">
                    <div className="w-[45%] flex flex-col text-[10px] text-center pt-1 border-r-[2px] border-black font-sans">
                        {breakdownEntries.map((entry, idx) => (
                            <div key={idx} className="flex mb-1">
                                <div className="w-[15%]">{entry.gst}</div>
                                <div className="w-[20%] text-right pr-2">{entry.basic.toFixed(2)}</div>
                                <div className="w-[21.6%] text-right pr-2">{entry.sgst.toFixed(2)}</div>
                                <div className="w-[21.6%] text-right pr-2">{entry.cgst.toFixed(2)}</div>
                                <div className="w-[21.6%] text-right pr-2">{entry.igst.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="w-[30%] border-r-[2px] border-black p-1 flex">
                        <div className="w-[60%] flex flex-col text-[10px] font-extrabold uppercase leading-snug justify-center pl-1">
                            NOTE: COMPULSORY<br />SEND PAYMENT SCREEN<br />SHOT TO 9879671136<br />NUMBER.
                        </div>
                        <div className="w-[40%] flex items-center justify-center p-1">
                            <svg viewBox="0 0 100 100" fill="currentColor" className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] text-black">
                                <rect width="100" height="100" fill="white" />
                                <rect x="5" y="5" width="25" height="25" fill="none" stroke="black" strokeWidth="4" />
                                <rect x="10" y="10" width="15" height="15" fill="black" />
                                <rect x="70" y="5" width="25" height="25" fill="none" stroke="black" strokeWidth="4" />
                                <rect x="75" y="10" width="15" height="15" fill="black" />
                                <rect x="5" y="70" width="25" height="25" fill="none" stroke="black" strokeWidth="4" />
                                <rect x="10" y="75" width="15" height="15" fill="black" />
                                <rect x="40" y="10" width="10" height="10" />
                                <rect x="55" y="25" width="10" height="10" />
                                <rect x="40" y="45" width="15" height="15" />
                                <rect x="80" y="45" width="10" height="10" />
                                <rect x="15" y="45" width="10" height="10" />
                                <rect x="65" y="70" width="10" height="10" />
                                <rect x="80" y="80" width="10" height="10" />
                                <rect x="45" y="85" width="10" height="10" />
                            </svg>
                        </div>
                    </div>
                    <div className="w-[25%] flex flex-col text-[11px] font-extrabold px-2 py-1 justify-between bg-white uppercase">
                        <div className="flex justify-between"><span>Less :</span><span>{(parseFloat(bill.discountAmount) || 0).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Add :</span><span>0.00</span></div>
                        <div className="flex justify-between"><span>TAX :</span><span>{(parseFloat(bill.taxTotal) || 0).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>R.Off. :</span><span>{roundOff.toFixed(2)}</span></div>
                    </div>
                </div>

                {/* 7. Net Amount Strip */}
                <div className="flex border-b-[2px] border-black items-center shrink-0 uppercase">
                    <div className="w-[75%] border-r-[2px] border-black flex px-2 py-[2px] font-extrabold text-[10px] md:text-[11px] justify-between">
                        <span>Terms & Condition :-</span>
                        <span>User : {bill.cashier || 'HAB CREATION'}</span>
                    </div>
                    <div className="w-[25%] px-2 py-[2px] flex justify-between items-center font-extrabold">
                        <span className="text-[11px] md:text-[12px]">Net Amount :</span>
                        <span className="text-[14px] md:text-[16px] -mr-1">{netAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* 8. Footer */}
                <div className="flex font-semibold text-[8px] uppercase leading-tight shrink-0 h-[70px] md:h-[80px]">
                    {/* Terms Left */}
                    <div className="w-[50%] p-1 border-r-[2px] border-black flex flex-col justify-end">
                        <div>1. Goods Once Sold Will Not Be Taken Back Or Exchange.</div>
                        <div>2. Any Complaint Regarding This Bill Must Be Settled Within 7 Days.</div>
                        <div>3. Subject to SURAT Jurisdiction.</div>
                        <div>4. Interest at the rate of 18% p.a. will be charged on bills not paid within 30 days.</div>
                        <div>5. E.&amp; O.E.</div>
                    </div>
                    {/* Bank Middle */}
                    <div className="w-[25%] p-1 border-r-[2px] border-black flex flex-col justify-end pb-2 pl-2 tracking-wide font-extrabold text-[9px]">
                        <div>BANK - ICICI BANK</div>
                        <div className="mt-1">IFSC CODE - ICIC0007505</div>
                        <div className="mt-1">A/C NUMBER - 133805004209</div>
                    </div>
                    {/* Signing Right */}
                    <div className="w-[25%] p-1 flex flex-col justify-between items-center relative">
                        <div className="font-extrabold w-full text-left pl-1">For, HAB CREATION</div>
                        <div className="w-20 h-8 opacity-60 italic flex items-center justify-center transform -rotate-[15deg] absolute bottom-4">
                            <span className="font-serif font-black text-xl text-blue-900 border-b-2 border-blue-900 leading-4">Signature</span>
                        </div>
                        <div className="font-extrabold w-full text-left bottom-0 absolute p-1 pl-2 text-[9px]">Autho. Sign.</div>
                    </div>
                </div>

            </div>

            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    html, body {
                        height: 100%;
                        width: 100%;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                    }
                    body * { visibility: hidden; }
                    #invoice-print, #invoice-print * { visibility: visible; }
                    #invoice-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        height: 100% !important;
                        background: white;
                        color: black;
                        margin: 0 !important;
                        padding: 5mm !important;
                        box-sizing: border-box;
                        display: flex !important;
                        flex-direction: column;
                        overflow: hidden;
                    }
                    .print\\:flex {
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceTemplate;
