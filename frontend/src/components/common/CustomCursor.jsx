import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useCursor } from '../../context/CursorContext';
import './CustomCursor.css';

const CustomCursor = () => {
    const { cursorType, setType, cursorContext, setContext, isLoading } = useCursor();
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Motion values for smooth movement
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Smooth springs for the ring (trailing effect)
    const springConfig = { damping: 25, stiffness: 250 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);
        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        const handleMouseOver = (e) => {
            const target = e.target;

            // Reset by default
            let newType = 'default';
            let newContext = null;

            // Check for interactive elements
            if (target.closest('a, button, .btn, [role="button"], .cursor-pointer')) {
                newType = 'pointer';
            } else if (target.closest('input, textarea, [contenteditable="true"], .input-control')) {
                newType = 'text';
            } else if (target.closest('.resize-handle, .resizable')) {
                newType = 'resize';
            } else if (target.closest('.draggable, [draggable="true"]')) {
                newType = 'drag';
            }

            // Check for custom cursor attributes
            const customType = target.closest('[data-cursor]')?.getAttribute('data-cursor');
            if (customType) newType = customType;

            const customContext = target.closest('[data-cursor-context]')?.getAttribute('data-cursor-context');
            if (customContext) newContext = customContext;

            setType(newType);
            setContext(newContext);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mouseenter', handleMouseEnter);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mouseenter', handleMouseEnter);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [mouseX, mouseY, isVisible, setType, setContext]);

    if (!isVisible) return null;

    return (
        <div className="cursor-container">
            {/* Main Dot - Follows mouse exactly */}
            <motion.div
                className="cursor-dot"
                style={{
                    left: mouseX,
                    top: mouseY,
                }}
            />

            {/* Trailing Ring - Physics based movement */}
            <motion.div
                className={`cursor-ring ${cursorType} ${isClicking ? 'clicking' : ''} ${isLoading ? 'loading' : ''}`}
                style={{
                    left: smoothX,
                    top: smoothY,
                }}
            >
                {/* Context Indicator */}
                <AnimatePresence>
                    {cursorContext && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="cursor-context"
                        >
                            {cursorContext}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default CustomCursor;
