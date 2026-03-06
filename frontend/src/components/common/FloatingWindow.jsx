import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Square, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingWindow = ({
    id,
    title,
    url,
    icon,
    zIndex,
    onClose,
    onFocus,
    onMinimize,
    initialWidth = 800,
    initialHeight = 600
}) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [prevSize, setPrevSize] = useState({ width: initialWidth, height: initialHeight });
    const [prevPos, setPrevPos] = useState({ x: 100, y: 100 });
    const [loading, setLoading] = useState(true);

    const toggleMaximize = () => {
        if (!isMaximized) {
            setPrevSize({ width: window.innerWidth * 0.8, height: window.innerHeight * 0.8 }); // Placeholder or actual
            setIsMaximized(true);
        } else {
            setIsMaximized(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        const iframe = document.getElementById(`iframe-${id}`);
        if (iframe) {
            iframe.src = iframe.src;
        }
    };

    const windowStyle = {
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pointerEvents: 'auto'
    };

    return (
        <Rnd
            default={{
                x: 100 + (Math.random() * 50),
                y: 50 + (Math.random() * 50),
                width: initialWidth,
                height: initialHeight,
            }}
            size={isMaximized ? { width: '95vw', height: '90vh' } : undefined}
            position={isMaximized ? { x: window.innerWidth * 0.025, y: window.innerHeight * 0.05 } : undefined}
            disableDragging={isMaximized}
            enableResizing={!isMaximized}
            minWidth={400}
            minHeight={300}
            bounds="window"
            onDragStart={onFocus}
            onResizeStart={onFocus}
            style={{ zIndex }}
            className="floating-window-rnd"
        >
            <div style={windowStyle} className="w-full h-full group">
                {/* Header Bar */}
                <div
                    className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 cursor-move select-none"
                    onDoubleClick={toggleMaximize}
                >
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-indigo-400">{icon}</div>}
                        <h3 className="text-sm font-semibold text-slate-200 truncate max-w-[200px]">
                            {title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={onMinimize}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                        <button
                            onClick={toggleMaximize}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <Square size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative bg-slate-900/50">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900/80 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                <span className="text-xs text-slate-400 font-medium">Loading Panel...</span>
                            </div>
                        </div>
                    )}
                    <iframe
                        id={`iframe-${id}`}
                        src={url}
                        className="w-full h-full border-none"
                        onLoad={() => setLoading(false)}
                        title={title}
                    />
                </div>

                {/* Resize Handle Accent (Optional UI Polish) */}
                {!isMaximized && (
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white/20 rounded-br pointer-events-none group-hover:border-indigo-500/50 transition-colors"></div>
                )}
            </div>

            <style>{`
                .floating-window-rnd {
                    transition: none !important; /* Prevent rnd transition jitter */
                }
            `}</style>
        </Rnd>
    );
};

export default FloatingWindow;
