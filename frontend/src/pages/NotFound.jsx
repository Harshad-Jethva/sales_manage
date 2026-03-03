import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Rocket, ArrowLeft, RotateCcw } from 'lucide-react';

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
                        className="z-10 flex flex-col items-center w-full max-w-4xl px-4"
                    >
                        <div className="w-full flex justify-between items-center mb-4">
                            <button
                                onClick={() => setIsPlaying(false)}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 py-2 px-4 rounded-lg hover:bg-white/10"
                            >
                                <ArrowLeft size={18} />
                                Quit
                            </button>
                            <h2 className="text-xl md:text-2xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase drop-shadow-md">
                                Star Defender
                            </h2>
                            <div className="w-[88px]"></div> {/* spacer for centering */}
                        </div>

                        <div className="w-full aspect-[4/3] md:aspect-[16/9] bg-slate-900 border-2 border-indigo-500/30 rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(99,102,241,0.15)] ring-1 ring-white/5">
                            <GameCanvas key={gameKey} onRestart={() => setGameKey(k => k + 1)} />
                        </div>
                        <p className="text-slate-500 mt-6 text-sm md:text-base text-center max-w-lg bg-black/20 p-3 rounded-xl border border-white/5">
                            Use <strong className="text-white">Left/Right Arrows</strong> or <strong className="text-white">Touch/Drag</strong> to move your ship. Avoid the red 404 meteors to survive!
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const GameCanvas = ({ onRestart }) => {
    const canvasRef = useRef(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    // Game state stored in a ref to persist across frames without re-rendering
    const gameState = useRef({
        player: { x: 300, y: 300, width: 36, height: 36, speed: 7, vx: 0, dragging: false },
        asteroids: [],
        particles: [],
        stars: [], // background stars
        score: 0,
        isGameOver: false,
        frameCount: 0,
        keys: { ArrowLeft: false, ArrowRight: false }
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Initialize background stars
        for (let i = 0; i < 50; i++) {
            gameState.current.stars.push({
                x: Math.random() * 2000,
                y: Math.random() * 2000,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.1
            });
        }

        // Set canvas resolution strictly to its display size
        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
            gameState.current.player.y = canvas.height - 40;
            gameState.current.player.x = canvas.width / 2;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Controls listeners
        const handleKeyDown = (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
                gameState.current.keys[e.code] = true;
            }
        };
        const handleKeyUp = (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
                gameState.current.keys[e.code] = false;
            }
        };

        // Touch / Mouse controls
        const getClinetX = (e) => {
            if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
            return e.clientX;
        };

        const handleInputStart = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = getClinetX(e) - rect.left;
            gameState.current.player.dragging = true;
            gameState.current.player.targetX = x;
        };
        const handleInputMove = (e) => {
            if (!gameState.current.player.dragging) return;
            e.preventDefault(); // Prevent scrolling on touch
            const rect = canvas.getBoundingClientRect();
            const x = getClinetX(e) - rect.left;
            gameState.current.player.targetX = x;
        };
        const handleInputEnd = () => {
            gameState.current.player.dragging = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        canvas.addEventListener('mousedown', handleInputStart);
        canvas.addEventListener('mousemove', handleInputMove);
        window.addEventListener('mouseup', handleInputEnd);

        // Use passive: false to allow preventDefault to stop scrolling
        canvas.addEventListener('touchstart', handleInputStart, { passive: false });
        canvas.addEventListener('touchmove', handleInputMove, { passive: false });
        window.addEventListener('touchend', handleInputEnd);

        // Helpers
        const createParticle = (x, y, color) => {
            gameState.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color
            });
        };

        const explode = (x, y) => {
            for (let i = 0; i < 30; i++) {
                createParticle(x, y, ['#818cf8', '#f472b6', '#38bdf8', '#fbbf24'][Math.floor(Math.random() * 4)]);
            }
        };

        // Main Game Loop
        const gameLoop = () => {
            const state = gameState.current;
            if (state.isGameOver) return;

            state.frameCount++;
            const w = canvas.width;
            const h = canvas.height;

            // Clear Frame
            ctx.fillStyle = '#020617'; // very dark slate
            ctx.fillRect(0, 0, w, h);

            // Draw Stars Background
            ctx.fillStyle = '#ffffff';
            state.stars.forEach(star => {
                star.y += star.speed + (state.score / 2000); // Speed up stars as score increases
                if (star.y > h) {
                    star.y = 0;
                    star.x = Math.random() * w;
                }
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // Player Movement
            const p = state.player;
            if (p.dragging && p.targetX !== undefined) {
                p.x += (p.targetX - p.x) * 0.15; // Smooth dragging interpolation
            } else {
                if (state.keys.ArrowLeft) p.vx = -p.speed;
                else if (state.keys.ArrowRight) p.vx = p.speed;
                else p.vx *= 0.85; // friction
                p.x += p.vx;
            }

            // Boundary checks
            if (p.x < p.width / 2) p.x = p.width / 2;
            if (p.x > w - p.width / 2) p.x = w - p.width / 2;

            // Draw Player Ship (Glowing Triangle)
            ctx.save();
            ctx.translate(p.x, p.y);

            // Engine Flame (dynamic sizes)
            ctx.fillStyle = '#f43f5e';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(-p.width / 3, p.height / 3);
            ctx.lineTo(p.width / 3, p.height / 3);
            ctx.lineTo(0, p.height / 2 + Math.random() * 20 + 5);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            // Ship body
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.moveTo(0, -p.height / 2);
            ctx.lineTo(p.width / 2, p.height / 2);
            ctx.lineTo(-p.width / 2, p.height / 2);
            ctx.closePath();
            ctx.fill();

            // Ship glass/cockpit
            ctx.fillStyle = '#93c5fd';
            ctx.beginPath();
            ctx.moveTo(0, -p.height / 4);
            ctx.lineTo(p.width / 6, p.height / 6);
            ctx.lineTo(-p.width / 6, p.height / 6);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            // Spawn Meteors/404s
            const difficultyMultiplier = Math.min(10, 1 + state.score / 1500);
            const spawnRate = Math.max(15, Math.floor(60 / difficultyMultiplier));

            if (state.frameCount % spawnRate === 0) {
                const is404 = Math.random() > 0.4; // 60% chance to be a '404' text enemy
                state.asteroids.push({
                    x: Math.random() * (w - 40) + 20,
                    y: -50,
                    radius: Math.random() * 15 + 15,
                    speed: Math.random() * 3 + 3 + (difficultyMultiplier * 1.5),
                    rotation: Math.random() * Math.PI * 2,
                    rSpeed: (Math.random() - 0.5) * 0.1,
                    type: is404 ? '404' : 'meteor',
                    color: is404 ? '#ef4444' : '#64748b'
                });
            }

            // Update & Draw Enemies
            for (let i = state.asteroids.length - 1; i >= 0; i--) {
                const a = state.asteroids[i];
                a.y += a.speed;
                a.rotation += a.rSpeed;

                ctx.save();
                ctx.translate(a.x, a.y);
                ctx.rotate(a.rotation);

                if (a.type === '404') {
                    ctx.font = 'bold 22px monospace';
                    ctx.fillStyle = a.color;
                    ctx.shadowColor = '#dc2626';
                    ctx.shadowBlur = 10;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('404', 0, 0);
                } else {
                    ctx.fillStyle = '#1e293b';
                    ctx.strokeStyle = a.color;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(a.radius, 0);
                    for (let j = 1; j < 6; j++) {
                        const angle = j * Math.PI * 2 / 6;
                        const r = a.radius * (0.8 + Math.random() * 0.4); // slightly jagged
                        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
                ctx.restore();

                // Collision Check (circle collision)
                const dx = p.x - a.x;
                const dy = p.y - a.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Make hit box slightly smaller than visuals to feel fair
                if (distance < a.radius + (p.width / 2) - 8) {
                    state.isGameOver = true;
                    explode(p.x, p.y);
                    setGameOver(true);
                }

                // Passed boundaries = score
                if (a.y > h + 50) {
                    state.asteroids.splice(i, 1);
                    state.score += 10;
                }
            }

            // Update & Draw Particles (Explosions)
            for (let i = state.particles.length - 1; i >= 0; i--) {
                const pt = state.particles[i];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.life -= 0.03; // Fade out speed
                if (pt.life <= 0) {
                    state.particles.splice(i, 1);
                    continue;
                }
                ctx.globalAlpha = pt.life;
                ctx.fillStyle = pt.color;

                // Add glowing effect to explosion
                ctx.shadowColor = pt.color;
                ctx.shadowBlur = 5;

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4 * pt.life, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }

            // Update score display occasionally to avoid rapid state updates in React
            if (state.frameCount % 5 === 0) {
                setScore(state.score);
            }

            if (!state.isGameOver) {
                animationFrameId = requestAnimationFrame(gameLoop);
            } else {
                // Render one final frame safely showing the explosion then stop
                ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
                ctx.fillRect(0, 0, w, h);
            }
        };

        // Start loop
        animationFrameId = requestAnimationFrame(gameLoop);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);

            if (canvas) {
                canvas.removeEventListener('mousedown', handleInputStart);
                canvas.removeEventListener('mousemove', handleInputMove);
                canvas.removeEventListener('touchstart', handleInputStart);
                canvas.removeEventListener('touchmove', handleInputMove);
            }
            window.removeEventListener('mouseup', handleInputEnd);
            window.removeEventListener('touchend', handleInputEnd);
        };
    }, []); // Run once on mount

    return (
        <>
            {/* Canvas Layer */}
            <canvas ref={canvasRef} className="block w-full h-full touch-none cursor-crosshair" />

            {/* Score HUD */}
            {!gameOver && (
                <div className="absolute top-4 right-4 bg-slate-900/80 px-4 py-2 rounded-full border border-indigo-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    <span className="font-mono text-indigo-300 font-bold tracking-wider">SCORE: {score}</span>
                </div>
            )}

            {/* Game Over Modal overlay */}
            <AnimatePresence>
                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="flex flex-col items-center p-8 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden"
                        >
                            {/* decorative glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>

                            <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-rose-600 mb-2 drop-shadow-lg z-10">
                                SHIP DESTROYED
                            </h3>

                            <div className="flex flex-col items-center my-6 z-10">
                                <p className="text-slate-400 text-sm font-semibold tracking-widest mb-1">FINAL SCORE</p>
                                <p className="text-5xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                                    {score}
                                </p>
                            </div>

                            <button
                                onClick={onRestart}
                                className="z-10 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 w-full"
                            >
                                <RotateCcw size={20} />
                                Try Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
