import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useCursor } from '../../context/CursorContext';
import './CelestialCursor.css';

const CelestialCursor = () => {
    const { cursorType, setType, cursorContext, setContext, isLoading } = useCursor();
    const [particles, setParticles] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Smooth springs for the main aura/glow
    const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    const lastPos = useRef({ x: 0, y: 0 });

    const addParticle = useCallback((x, y) => {
        const id = Date.now() + Math.random();
        // Randomized star properties
        const particle = {
            id,
            x,
            y,
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            duration: Math.random() * 1 + 0.5,
            color: Math.random() > 0.5 ? '#FFD700' : '#48CAE4' // Gold or Light Blue
        };

        setParticles(prev => [...prev.slice(-20), particle]); // Keep last 20 particles

        // Remove particle after animation
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, particle.duration * 1000);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);

            if (!isVisible) setIsVisible(true);

            // Distance threshold for adding particles to avoid flooding
            const dist = Math.hypot(e.clientX - lastPos.current.x, e.clientY - lastPos.current.y);
            if (dist > 15) {
                addParticle(e.clientX, e.clientY);
                lastPos.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        const handleMouseOver = (e) => {
            const target = e.target;
            let newType = 'default';
            let newContext = null;

            if (target.closest('a, button, .btn, [role="button"], .cursor-pointer')) {
                newType = 'pointer';
            } else if (target.closest('input, textarea, [contenteditable="true"], .input-control')) {
                newType = 'text';
            }

            const customType = target.closest('[data-cursor]')?.getAttribute('data-cursor');
            if (customType) newType = customType;

            const customContext = target.closest('[data-cursor-context]')?.getAttribute('data-cursor-context');
            if (customContext) newContext = customContext;

            setType(newType);
            setContext(newContext);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mouseenter', handleMouseEnter);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mouseenter', handleMouseEnter);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [mouseX, mouseY, isVisible, addParticle, setType, setContext]);

    if (!isVisible) return null;

    return (
        <div className="celestial-cursor-container">
            {/* Main Light Aura (Glow) */}
            <motion.div
                className="cursor-aura"
                style={{
                    left: smoothX,
                    top: smoothY,
                }}
            />

            {/* Core Point (Light) */}
            <motion.div
                className="cursor-core"
                style={{
                    left: mouseX,
                    top: mouseY,
                }}
            />

            {/* Star Particles */}
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{
                            opacity: 1,
                            scale: 0,
                            x: p.x,
                            y: p.y,
                            rotate: p.rotation
                        }}
                        animate={{
                            opacity: 0,
                            scale: 1,
                            y: p.y + (Math.random() - 0.5) * 50,
                            x: p.x + (Math.random() - 0.5) * 50,
                            rotate: p.rotation + 90
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: p.duration, ease: "easeOut" }}
                        className="star-particle"
                        style={{
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            boxShadow: `0 0 10px ${p.color}`,
                        }}
                    >
                        <StarIcon />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Cursor Type Indicator (Circle) */}
            <motion.div
                className={`cursor-ring ${cursorType} ${isLoading ? 'loading' : ''}`}
                style={{
                    left: smoothX,
                    top: smoothY,
                    scale: cursorType === 'pointer' ? 1.5 : 1
                }}
            />

            {/* Context Label */}
            {cursorContext && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="cursor-label"
                    style={{
                        left: mouseX,
                        top: mouseY,
                    }}
                >
                    {cursorContext}
                </motion.div>
            )}
        </div>
    );
};

const StarIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

export default CelestialCursor;
