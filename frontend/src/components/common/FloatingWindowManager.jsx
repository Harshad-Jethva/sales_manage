import React from 'react';
import { useFloatingWindows } from '../../context/FloatingWindowContext';
import FloatingWindow from './FloatingWindow';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingTaskbar from './FloatingTaskbar';

const FloatingWindowManager = () => {
    const { windows, closeWindow, focusWindow, toggleMinimize } = useFloatingWindows();

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* Background Blur Overlay for Layered Effect */}
            <AnimatePresence>
                {windows.some(w => !w.minimized) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {windows.map((win) => (
                    !win.minimized && (
                        <FloatingWindow
                            key={win.id}
                            {...win}
                            onClose={() => closeWindow(win.id)}
                            onFocus={() => focusWindow(win.id)}
                            onMinimize={() => toggleMinimize(win.id)}
                        />
                    )
                ))}
            </AnimatePresence>

            <FloatingTaskbar />

            {/* Taskbar or minimized window indicators can go here if needed later */}
        </div>
    );
};

export default FloatingWindowManager;
