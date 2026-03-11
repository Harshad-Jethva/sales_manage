import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Rocket, ArrowLeft, RotateCcw } from 'lucide-react';
import RacingGame from '../components/404/RacingGame';

// Floating particles background for the 404 page
const Particles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: Math.random() * 4 + 2 + 'px',
                        height: Math.random() * 4 + 2 + 'px',
                        backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#38bdf8'][Math.floor(Math.random() * 4)],
                        opacity: Math.random() * 0.5 + 0.1,
                    }}
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                    }}
                    animate={{
                        y: [null, Math.random() * -1000],
                        x: [null, (Math.random() - 0.5) * 500],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default function NotFound() {
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameKey, setGameKey] = useState(0); // Used to force remount of GameCanvas on restart

    return (
        <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans text-white w-full">
            <Particles />

            <AnimatePresence mode="wait">
                {!isPlaying ? (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="z-10 flex flex-col items-center text-center p-8 backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-3xl shadow-2xl max-w-lg w-[90%]"
                    >
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="relative"
                        >
                            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 mb-2 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                                404
                            </h1>
                        </motion.div>

                        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-100">Lost in the Matrix</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            The page you are looking for has been destroyed by a rogue AI or simply doesn't exist.
                            You can return safely to the system or stay and defend your sector.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all duration-300 ring-1 ring-white/20 hover:ring-white/40"
                            >
                                <Home size={20} />
                                Return Home
                            </button>

                            <button
                                onClick={() => setIsPlaying(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-1"
                            >
                                <Rocket size={20} />
                                Play Mini-Game
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="z-10 flex flex-col items-center w-full max-w-5xl px-4"
                    >
                        <div className="w-full aspect-[4/3] md:aspect-[16/9] bg-slate-900 border-2 border-indigo-500/30 rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(99,102,241,0.15)] ring-1 ring-white/5">
                            <RacingGame onQuit={() => setIsPlaying(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


