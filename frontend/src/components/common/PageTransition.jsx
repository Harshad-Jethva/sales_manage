import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
    const nodeRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        // Reveal and slide up animation using GSAP
        // Added clearProps to prevent transform sticking and breaking fixed children
        gsap.fromTo(
            nodeRef.current,
            { opacity: 0, y: 30, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', clearProps: 'all' }
        );
    }, [location.pathname]);

    return (
        <div ref={nodeRef} className="w-full h-full page-transition-wrapper">
            {children}
        </div>
    );
};

export default PageTransition;
