import React from 'react';

const InvoiceTemplate = ({ bill, isHistoryView = false }) => {
    if (!bill) return null;

    return (
        <div id={isHistoryView ? "history-invoice" : "invoice-print"} className={`${isHistoryView ? 'flex' : 'hidden print:flex'} flex-col bg-white text-black font-sans mx-auto p-[3mm] box-border w-full h-[98vh] overflow-hidden`}>
            {/* Outline Border of the entire Invoice */}
            <div className="border-[1.5px] border-black flex flex-col flex-1 h-full w-full">

                {/* 1. Header Row (Logo + Company Info) */}
                <div className="flex border-b-[1.5px] border-black flex-shrink-0 pb-1 pt-1">
                    {/* Left: LOGO */}
                    <div className="w-[30%] flex flex-col items-center justify-center px-2">
                        {/* Placeholder Swan shape */}
                        <div className="w-10 h-8 -mb-1">
                            <svg viewBox="0 0 100 80" className="w-full h-full fill-blue-900">
                                <path d="M50 0 C40 10, 30 20, 30 35 C30 50, 45 45, 50 60 C55 45, 70 50, 70 35 C70 20, 60 10, 50 0 Z M30 35 C20 40, 10 50, 10 65 C10 80, 50 80, 50 80 C50 80, 40 70, 40 55 C40 45, 30 35, 30 35 Z" />
                            </svg>
                        </div>
                        <h1 className="text-[16px] xl:text-[20px] font-bold text-blue-900 tracking-widest uppercase m-0 leading-none">BRAHMANI</h1>
                    </div>

                    {/* Right: Text Information */}
                    <div className="w-[70%] relative flex flex-col justify-center text-center p-1">
                        {/* Top corner texts absolute positioned */}
                        <div className="absolute top-0 right-2 text-[7px] md:text-[9px] font-bold tracking-tight">YOUR ORDER IS BLESSING, THANK YOU.</div>
                        <div className="absolute top-3 right-2 text-[7px] md:text-[9px]">Original / Duplicate</div>

                        <h2 className="text-[20px] md:text-[26px] font-extrabold m-0 leading-none tracking-widest uppercase mt-2">BRAHMANI</h2>
                        <div className="text-[7px] md:text-[9px] font-semibold leading-tight mt-1">
                            PLOT NO.4-5,PURANBAG IND.,GAJERA CIRCLE, KATARGAM, SURAT.-395008<br />
                            PHONE : 98796-71136,    EMAIL ID: BRAHMANI.WHOLESALE@GMAIL.COM<br />
                            GSTIN : 24AAUFB3398Q1ZH
                        </div>
                        <div className="font-bold text-[10px] md:text-[13px] tracking-wider mt-[2px]">TAX INVOICE</div>
                        <div className="absolute bottom-0 right-2 text-[8px] md:text-[10px] uppercase font-bold">CASH BILL</div>
                    </div>
                </div>

                {/* 2. Customer & Bill Info Row */}
                <div className="flex border-b-[1.5px] border-black flex-shrink-0 text-[8px] md:text-[10px]">
                    <div className="w-[65%] border-r-[1.5px] border-black flex flex-col pl-1 py-1">
                        <div className="flex border-b border-black pb-1">
                            <div className="w-[45px] font-bold">Name :</div>
                            <div className="flex-1 font-bold uppercase">
                                {bill.selectedClient?.name || 'CASH CUSTOMER'}
                                {bill.selectedClient?.shop_name ? ` (${bill.selectedClient.shop_name})` : ''}
                            </div>
                        </div>
                        <div className="flex flex-1 pt-[2px]">
                            <div className="w-[45px] font-bold underline">Add:</div>
                            <div className="flex-1 uppercase leading-snug">
                                {bill.selectedClient?.address || ''}<br />
                                {bill.selectedClient?.city ? `${bill.selectedClient.city}` : ''}
                            </div>
                        </div>
                        <div className="flex mt-[2px]">
                            <div className="w-1/2 flex">
                                <div className="font-bold mr-2 uppercase tracking-wide">GSTIN:</div>
                                <div className="uppercase">{bill.selectedClient?.gstin || ''}</div>
                            </div>
                            <div className="w-1/2 flex">
                                <div className="font-bold mr-2 tracking-wide uppercase">PHONE :</div>
                                <div>{bill.selectedClient?.phone || ''}</div>
                            </div>
                        </div>
                    </div>

                    <div className="w-[35%] flex flex-col py-1">
                        <div className="flex flex-1 border-b border-black items-center px-1 pb-1">
                            <div className="w-[60px] font-bold">BILL NO</div>
                            <div className="w-[10px]">:</div>
                            <div className="flex-1 font-bold text-[10px] md:text-[12px]">{bill.billNo}</div>
                        </div>
                        <div className="flex flex-1 border-b border-black items-center px-1 py-1">
                            <div className="w-[60px] font-bold">BILL DT.</div>
                            <div className="w-[10px]">:</div>
                            <div className="flex-1">{bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</div>
                        </div>
                        <div className="flex flex-1 items-center px-1 pt-1">
                            <div className="w-[60px] font-bold">BILL TIME</div>
                            <div className="w-[10px]">:</div>
                            <div className="flex-1">{bill.created_at ? new Date(bill.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}</div>
                        </div>
                    </div>
                </div>

                {/* 3. Table Headers Row */}
                <div className="flex border-b-2 border-black text-[8px] md:text-[10px] font-bold text-center items-center py-1 flex-shrink-0">
                    <div className="w-[6%] pr-[2px]">SR.</div>
                    <div className="w-[40%] text-left pl-2">DESCRIPTION</div>
                    <div className="w-[8%]">HSN</div>
                    <div className="w-[5%]">QTY</div>
                    <div className="w-[8%]">RATE</div>
                    <div className="w-[11%]">DISC.%</div>
                    <div className="w-[8%]">N.RATE</div>
                    <div className="w-[5%]">GST%</div>
                    <div className="w-[9%] text-right pr-1">AMOUNT</div>
                </div>

                {/* 4. Table Body (Fills remaining height) */}
                <div className="relative flex-1 bg-white text-[8px] md:text-[10px] font-mono leading-tight overflow-hidden">
                    {/* Background Column Lines */}
                    <div className="absolute inset-0 flex pointer-events-none border-b-[1.5px] border-black z-0 h-full">
                        <div className="w-[6%] border-r-[1.5px] border-black h-full"></div>
                        <div className="w-[40%] border-r-[1.5px] border-black h-full"></div>
                        <div className="w-[8%] border-r-[1.5px] border-black h-full"></div>
                        <div className="w-[5%] border-r-[1.5px] border-black h-full"></div>
                        <div className="w-[8%] border-r-[1.5px] border-black h-full"></div>
                        <div className="w-[11%] border-r-[1.5px] border-black h-full"></div>
                        <div className="w-[8%] border-r-[1.5px] border-black h-full"></div>
                        <div className="w-[5%] border-r-[1.5px] border-black h-full"></div>
                        <div className="w-[9%] h-full"></div>
                    </div>

                    {/* Actual Rows */}
                    <div className="relative z-10 w-full pt-1">
                        {bill.cart?.map((item, index) => {
                            const rate = parseFloat(item.price || 0);
                            const qty = parseFloat(item.qty || 1);
                            const discP = parseFloat(item.discountPercent || 0);
                            const nRate = rate * (1 - (discP / 100));
                            const gst = parseFloat(item.gst_percent || 18);
                            const amt = nRate * qty;

                            return (
                                <div key={index} className="flex mb-1">
                                    <div className="w-[6%] text-center px-[2px] font-bold font-sans">{index + 1}</div>
                                    <div className="w-[40%] px-[2px] font-sans font-bold whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
                                    <div className="w-[8%] text-center px-[2px]">{item.sku || '960810'}</div>
                                    <div className="w-[5%] text-center px-[2px] font-bold font-sans">{qty}</div>
                                    <div className="w-[8%] text-right px-[2px]">{rate.toFixed(2)}</div>
                                    <div className="w-[11%] text-center px-[2px] font-sans">0+0+0+{discP.toFixed(0)}</div>
                                    <div className="w-[8%] text-right px-[2px]">{nRate.toFixed(2)}</div>
                                    <div className="w-[5%] text-center px-[2px]">{gst}%</div>
                                    <div className="w-[9%] text-right pr-1 px-[2px] font-sans text-[9px] md:text-[11px]">{amt.toFixed(4)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 5. Summary Row Title Area */}
                <div className="flex border-b-[1.5px] border-black text-[8px] md:text-[10px] font-bold py-1 items-center text-center tracking-wide flex-shrink-0">
                    <div className="w-[30%]">GST%<span className="inline-block w-4"></span>BASIC</div>
                    <div className="w-[10%]">SGST</div>
                    <div className="w-[10%]">CGST</div>
                    <div className="w-[10%] border-r-[1.5px] border-black">IGST</div>

                    <div className="w-[15%] border-r-[1.5px] border-black uppercase text-center flex-1">
                        PAYMENT QR CODE
                    </div>

                    <div className="w-[20%] flex justify-between px-2 tracking-wide font-sans w-full">
                        <span>BASIC :</span>
                        <span>{parseFloat(bill.subTotal || 0).toFixed(2)}</span>
                    </div>
                </div>

                {/* 6. Summary Values Row */}
                <div className="flex text-[8px] md:text-[10px] py-1 flex-shrink-0">
                    <div className="w-[60%] border-r-[1.5px] border-black flex font-mono">
                        {/* Mock GST break down block */}
                        <div className="w-full flex pt-[2px] text-center items-start">
                            <div className="w-[15%]">18</div>
                            <div className="w-[25%]">{parseFloat(bill.subTotal || 0).toFixed(2)}</div>
                            <div className="w-[20%]">{(parseFloat(bill.taxTotal || 0) / 2).toFixed(2)}</div>
                            <div className="w-[20%]">{(parseFloat(bill.taxTotal || 0) / 2).toFixed(2)}</div>
                            <div className="w-[20%]">0.00</div>
                        </div>
                    </div>

                    <div className="w-[20%] border-r border-black p-1 flex items-center justify-between">
                        <div className="flex-1 font-bold text-[6px] md:text-[8px] leading-[8px] md:leading-[10px] pr-1 font-sans">
                            NOTE: COMPULSORY SEND PAYMENT SCREEN SHOT TO 9879671136 NUMBER.
                        </div>
                        <div className="w-[20px] h-[20px] md:w-[26px] md:h-[26px] flex-shrink-0 border border-black/50 overflow-hidden">
                            {/* Simple inline placeholder SVG mimicking a QR code */}
                            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-black">
                                <rect width="100" height="100" fill="white" />
                                <rect x="5" y="5" width="20" height="20" />
                                <rect x="75" y="5" width="20" height="20" />
                                <rect x="5" y="75" width="20" height="20" />
                                <rect x="35" y="25" width="10" height="10" />
                                <rect x="55" y="65" width="10" height="10" />
                                <rect x="45" y="85" width="10" height="10" />
                                <rect x="85" y="45" width="10" height="10" />
                                <rect x="25" y="45" width="10" height="10" />
                            </svg>
                        </div>
                    </div>

                    {/* Right side calculation list */}
                    <div className="w-[20%] flex flex-col font-bold px-1 font-sans">
                        <div className="flex justify-between"><span>Less :</span><span>{parseFloat(bill.discountAmount || 0).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Add :</span><span>0.00</span></div>
                        <div className="flex justify-between"><span>TAX :</span><span>{parseFloat(bill.taxTotal || 0).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>R.Off. :</span><span>0.00</span></div>
                    </div>
                </div>

                {/* 7. Strip Bar for Net Amount */}
                <div className="flex border-t-[1.5px] border-b-[1.5px] border-black items-center px-1 py-1 font-bold bg-gray-50/20 flex-shrink-0">
                    <div className="w-[60%] flex gap-10">
                        <span className="text-[9px] md:text-[11px]">Terms & Condition :-</span>
                        <span className="text-[9px] md:text-[11px]">User : {bill.cashier || 'BRAHMANI'}</span>
                    </div>
                    <div className="w-[40%] flex justify-end gap-12 pr-1 items-center">
                        <span className="text-[10px] md:text-[12px]">Net Amount :</span>
                        <span className="text-[12px] md:text-[14px] inline-block -mx-1">{parseFloat(bill.finalTotal || 0).toFixed(2)}</span>
                    </div>
                </div>

                {/* 8. Footer Legal/Signatures */}
                <div className="flex text-[6px] md:text-[7.5px] tracking-tight uppercase leading-[8px] md:leading-[9px] flex-shrink-0">
                    <div className="w-[50%] p-1 border-r-[1.5px] border-black border-dashed flex flex-col justify-end font-medium">
                        1. Goods Once Sold Will Not Be Taken Back Or Exchange.<br />
                        2. Any Complaint Regarding This Bill Must Be Settled Imm<br />
                        3. Subject to SURAT Jurisdiction.<br />
                        4. Interest at the rate of 18% p.a. will be charged on bills not paid within 30 days.<br />
                        5. E.& O.E.
                    </div>

                    <div className="w-[30%] p-1 border-r-[1.5px] border-black flex flex-col font-bold justify-center">
                        <div>BANK - ICICI BANK</div>
                        <div>IFSC CODE - ICIC0007505</div>
                        <div>A/C NUMBER - 183605004209</div>
                    </div>

                    <div className="w-[20%] p-1 flex flex-col justify-between text-center relative items-center">
                        <div className="font-bold w-full uppercase">For, BRAHMANI</div>
                        {/* Placeholder Signature Graphic */}
                        <div className="w-16 h-4 md:h-8 text-blue-900/30 font-serif italic text-sm md:text-lg mt-1 md:mt-2 skew-x-[-15deg] font-bold flex items-center justify-center">
                            Sign
                        </div>
                        <div className="w-full font-bold pt-[1px] mt-auto">Autho. Sign.</div>
                    </div>
                </div>

            </div>

            <style>{`
                @media print {
                    @page { margin: 3mm; size: auto; }
                    body { background: white; margin: 0; padding: 0; }
                    body * { visibility: hidden; }
                    #invoice-print, #invoice-print * { visibility: visible; }
                    #invoice-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important; 
                        height: 99vh !important;
                        max-height: 99vh !important;
                        background: white;
                        color: black;
                        margin: 0;
                        box-sizing: border-box;
                        display: flex !important;
                        flex-direction: column;
                        overflow: hidden;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceTemplate;
