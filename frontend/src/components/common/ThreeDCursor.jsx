import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from '../../context/CursorContext';
import './ThreeDCursor.css';

/**
 * Premium 3D Cursor Component for ERP
 * Features: 3D Tilt, Magnetic Attraction, Layered Depth, Contextual Indicators, Star Particles, Light Flare
 */
const ThreeDCursor = () => {
    const { cursorType, cursorContext, isLoading } = useCursor();
    const [isVisible, setIsVisible] = useState(false);
    const [clickEffect, setClickEffect] = useState(false);
    const [particles, setParticles] = useState([]);

    // Refs for DOM elements and animation values
    const cursorRef = useRef(null);
    const trailRef = useRef(null);
    const lightRef = useRef(null);
    const pos = useRef({ x: 0, y: 0 });
    const delayPos = useRef({ x: 0, y: 0 });
    const tilt = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const lastTime = useRef(performance.now());
    const magneticTarget = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            pos.current = { x: e.clientX, y: e.clientY };
            if (!isVisible) setIsVisible(true);

            // Create star particles on move - INCREASED FREQUENCY & VARIETY
            if (Math.random() > 0.4) { // More frequent particles
                const id = Math.random().toString(36).substr(2, 9);
                const colors = ['#ffffff', '#818cf8', '#34d399', '#f472b6']; // Multi-color stars
                const color = colors[Math.floor(Math.random() * colors.length)];

                const newParticle = {
                    id,
                    x: e.clientX,
                    y: e.clientY,
                    size: Math.random() * 4 + 1,
                    vx: (Math.random() - 0.5) * 3, // Faster spread
                    vy: (Math.random() - 0.5) * 3,
                    life: 1.0,
                    color: color,
                    rotation: Math.random() * 360
                };
                setParticles(prev => [...prev.slice(-40), newParticle]); // Increased buffer from 15 to 40
            }

            // Check for magnetic elements nearby
            const target = e.target.closest('button, .magnetic, [data-cursor="pointer"], a');
            if (target) {
                const rect = target.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distance = Math.sqrt(
                    Math.pow(pos.current.x - centerX, 2) +
                    Math.pow(pos.current.y - centerY, 2)
                );

                if (distance < 120) {
                    magneticTarget.current = { x: centerX, y: centerY };
                } else {
                    magneticTarget.current = null;
                }
            } else {
                magneticTarget.current = null;
            }
        };

        const handleMouseDown = () => setClickEffect(true);
        const handleMouseUp = () => setClickEffect(false);
        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mouseenter', handleMouseEnter);

        // Core animation loop for 60FPS
        let rafId;
        const animate = (time) => {
            // Update particles life
            setParticles(prev => prev.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                life: p.life - 0.02
            })).filter(p => p.life > 0));

            const lerp = (start, end, factor) => start + (end - start) * factor;

            const targetX = magneticTarget.current ? lerp(pos.current.x, magneticTarget.current.x, 0.4) : pos.current.x;
            const targetY = magneticTarget.current ? lerp(pos.current.y, magneticTarget.current.y, 0.4) : pos.current.y;

            delayPos.current.x = lerp(delayPos.current.x, targetX, 0.15);
            delayPos.current.y = lerp(delayPos.current.y, targetY, 0.15);

            velocity.current.x = (pos.current.x - delayPos.current.x) * 0.1;
            velocity.current.y = (pos.current.y - delayPos.current.y) * 0.1;

            tilt.current.x = Math.max(-25, Math.min(25, -velocity.current.y * 2));
            tilt.current.y = Math.max(-25, Math.min(25, velocity.current.x * 2));

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
            }

            if (lightRef.current) {
                lightRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
            }

            if (trailRef.current) {
                const magneticScale = magneticTarget.current ? 1.4 : 1;
                trailRef.current.style.transform = `
                    translate3d(${delayPos.current.x}px, ${delayPos.current.y}px, 0)
                    rotateX(${tilt.current.x}deg)
                    rotateY(${tilt.current.y}deg)
                    scale(${magneticScale})
                `;
            }

            rafId = requestAnimationFrame(animate);
        };

        rafId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mouseenter', handleMouseEnter);
            cancelAnimationFrame(rafId);
        };
    }, [isVisible]);

    const getIcon = (context) => {
        switch (context) {
            case '+': return <IconAdd />;
            case 'edit': return <IconEdit />;
            case 'delete': return <IconDelete />;
            case 'view': case 'eye': return <IconView />;
            default: return null;
        }
    };

    if (!isVisible) return null;

    return (
        <div className="erp-3d-cursor-container">
            {/* Dynamic Light Flare */}
            <div ref={lightRef} className="cursor-light-flare" />

            {/* Star Particles - ENHANCED DESIGN */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className="cursor-star-particle"
                    style={{
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        opacity: p.life,
                        backgroundColor: p.color,
                        boxShadow: `0 0 8px ${p.color}, 0 0 15px ${p.color}aa`,
                        transform: `scale(${p.life}) rotate(${p.rotation + (1.0 - p.life) * 100}deg)`
                    }}
                />
            ))}

            {/* Direct Cursor (The Point) */}
            <div ref={cursorRef} className="cursor-core-system">
                <div className="core-dot"></div>
            </div>

            {/* 3D Trailing System */}
            <div ref={trailRef} className={`cursor-3d-trail ${cursorType} ${clickEffect ? 'clicking' : ''} ${isLoading ? 'loading' : ''}`}>
                <div className="trail-layers">
                    {/* Glow Layer */}
                    <div className="layer layer-glow"></div>

                    {/* Glass Frame Layer */}
                    <div className="layer layer-frame">
                        <div className="glass-inner"></div>
                    </div>

                    {/* Content Layer */}
                    <div className="layer layer-content">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className="spinner-3d"
                                />
                            ) : cursorContext ? (
                                <motion.div
                                    key="context"
                                    initial={{ opacity: 0, z: -20, rotateY: 90 }}
                                    animate={{ opacity: 1, z: 20, rotateY: 0 }}
                                    exit={{ opacity: 0, z: -20, rotateY: -90 }}
                                    className="context-icon"
                                >
                                    {getIcon(cursorContext)}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Ripple Effect */}
            <AnimatePresence>
                {clickEffect && (
                    <motion.div
                        initial={{ opacity: 0.6, scale: 0, x: pos.current.x, y: pos.current.y }}
                        animate={{ opacity: 0, scale: 3.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="cursor-ripple"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const IconAdd = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const IconEdit = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const IconDelete = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

const IconView = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export default ThreeDCursor;
