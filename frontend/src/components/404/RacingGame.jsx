import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Sparkles, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Zap, Trophy, Coins, Clock, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';

const ROAD_LENGTH = 300;
const ROAD_WIDTH = 14;
const BASE_SPEED = 40;
const BOOST_SPEED = 120;
const CAR_BOUNDS = ROAD_WIDTH / 2 - 1.5;

// High-performance game state external to React render cycle
const state = {
    speed: 0,
    targetSpeed: BASE_SPEED,
    score: 0,
    carPosition: new THREE.Vector3(0, 0, 0),
    carVelocity: new THREE.Vector3(0, 0, 0),
    isGameOver: false,
    isBoosting: false,
    mode: 'Endless',
    timeRemaining: 60,
    coinsCollected: 0,
    distanceElapsed: 0,
    keys: { ArrowLeft: false, ArrowRight: false, ArrowUp: false, Space: false }
};

// Controls setup
const setupControls = () => {
    state.keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, Space: false }; // reset
    const down = (e) => {
        if (state.keys.hasOwnProperty(e.code) || e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyD') {
            if (e.code === 'KeyA') state.keys.ArrowLeft = true;
            else if (e.code === 'KeyD') state.keys.ArrowRight = true;
            else if (e.code === 'KeyW') state.keys.ArrowUp = true;
            else state.keys[e.code] = true;
        }
    };
    const up = (e) => {
        if (state.keys.hasOwnProperty(e.code) || e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyD') {
            if (e.code === 'KeyA') state.keys.ArrowLeft = false;
            else if (e.code === 'KeyD') state.keys.ArrowRight = false;
            else if (e.code === 'KeyW') state.keys.ArrowUp = false;
            else state.keys[e.code] = false;
        }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
        window.removeEventListener('keydown', down);
        window.removeEventListener('keyup', up);
    };
};

const PlayerCar = () => {
    const carRef = useRef();
    const wheelsRef = useRef([]);

    useFrame((_, delta) => {
        if (state.isGameOver) return;

        let inputX = 0;
        if (state.keys.ArrowLeft) inputX = -1;
        if (state.keys.ArrowRight) inputX = 1;

        let isBoost = state.keys.Space || state.keys.ArrowUp;
        state.isBoosting = isBoost;

        let targetSpeed = BASE_SPEED;
        if (isBoost) targetSpeed = BOOST_SPEED;

        state.speed = THREE.MathUtils.lerp(state.speed, targetSpeed, delta * 3);

        // Steering
        state.carVelocity.x = THREE.MathUtils.lerp(state.carVelocity.x, inputX * 20, delta * 6);
        state.carPosition.x += state.carVelocity.x * delta;

        // Bounds
        if (state.carPosition.x > CAR_BOUNDS) state.carPosition.x = CAR_BOUNDS;
        if (state.carPosition.x < -CAR_BOUNDS) state.carPosition.x = -CAR_BOUNDS;

        if (carRef.current) {
            carRef.current.position.x = state.carPosition.x;

            // Leaning effect (rotation)
            carRef.current.rotation.z = THREE.MathUtils.lerp(carRef.current.rotation.z, -inputX * 0.2, delta * 5);
            carRef.current.rotation.y = THREE.MathUtils.lerp(carRef.current.rotation.y, -inputX * 0.15, delta * 5);

            // Speed shake effect
            if (state.speed > BASE_SPEED + 20) {
                carRef.current.position.y = (Math.random() - 0.5) * 0.05 + 0.3;
            } else {
                carRef.current.position.y = 0.3;
            }
        }

        // Spin wheels
        wheelsRef.current.forEach(wheel => {
            if (wheel) wheel.rotation.x -= (state.speed / 5) * delta;
        });
    });

    return (
        <group ref={carRef} position={[0, 0.3, 0]}>
            {/* Boost Flame */}
            {state.isBoosting && (
                <mesh position={[0, 0.2, 2]} rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.4, 1.5, 8]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
                </mesh>
            )}

            {/* Main Body */}
            <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[1.8, 0.6, 4]} />
                <meshStandardMaterial color="#6366f1" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Cockpit */}
            <mesh position={[0, 0.8, -0.2]} castShadow>
                <boxGeometry args={[1.4, 0.5, 1.8]} />
                <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Neon Strips */}
            <mesh position={[-0.91, 0.4, 0]}>
                <boxGeometry args={[0.05, 0.1, 3.8]} />
                <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.91, 0.4, 0]}>
                <boxGeometry args={[0.05, 0.1, 3.8]} />
                <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} />
            </mesh>
            {/* Headlights */}
            <mesh position={[-0.6, 0.4, -2.01]}>
                <boxGeometry args={[0.4, 0.15, 0.1]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.6, 0.4, -2.01]}>
                <boxGeometry args={[0.4, 0.15, 0.1]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Taillights */}
            <mesh position={[-0.6, 0.4, 2.01]}>
                <boxGeometry args={[0.4, 0.15, 0.1]} />
                <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.6, 0.4, 2.01]}>
                <boxGeometry args={[0.4, 0.15, 0.1]} />
                <meshBasicMaterial color="#ef4444" />
            </mesh>

            {/* Wheels */}
            {[-.95, .95].map((x, i) =>
                [-1.3, 1.3].map((z, j) => (
                    <mesh key={`${x}-${z}`} ref={el => wheelsRef.current[i * 2 + j] = el} position={[x, 0.1, z]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.8} />
                        {/* Wheel glow rim */}
                        <mesh position={[0, (x > 0 ? 0.16 : -0.16), 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[0.2, 0.25, 16]} />
                            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
                        </mesh>
                    </mesh>
                ))
            )}
        </group>
    );
};

const Road = () => {
    const gridRef = useRef();

    useFrame((_, delta) => {
        if (state.isGameOver) return;
        if (gridRef.current) {
            gridRef.current.position.z += state.speed * delta;
            // loop the grid roughly every 10 units
            if (gridRef.current.position.z > 20) {
                gridRef.current.position.z -= 20;
            }
        }
    });

    return (
        <group>
            {/* The infinite scrolling grid */}
            <group ref={gridRef}>
                <gridHelper args={[ROAD_WIDTH * 1.5, 120, '#6366f1', '#1e293b']} position={[0, 0.02, -ROAD_LENGTH / 4]} />
            </group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -ROAD_LENGTH / 2]} receiveShadow>
                <planeGeometry args={[ROAD_WIDTH * 1.5, ROAD_LENGTH]} />
                <meshStandardMaterial color="#020617" roughness={0.8} />
            </mesh>
            {/* Neon Borders */}
            <mesh position={[-ROAD_WIDTH / 2, 0.3, -ROAD_LENGTH / 2]} receiveShadow>
                <boxGeometry args={[0.5, 0.5, ROAD_LENGTH]} />
                <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[ROAD_WIDTH / 2, 0.3, -ROAD_LENGTH / 2]} receiveShadow>
                <boxGeometry args={[0.5, 0.5, ROAD_LENGTH]} />
                <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
            </mesh>
        </group>
    );
};

const Scenery = () => {
    const items = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
        x: (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 2 + 2 + Math.random() * 15),
        z: -Math.random() * ROAD_LENGTH,
        scale: Math.random() * 3 + 1,
        color: ['#0ea5e9', '#a855f7', '#ec4899', '#2dd4bf'][Math.floor(Math.random() * 4)]
    })), []);

    const refs = useRef([]);

    useFrame((_, delta) => {
        if (state.isGameOver) return;
        items.forEach((item, i) => {
            item.z += state.speed * delta;
            if (item.z > 15) {
                item.z = -ROAD_LENGTH;
            }
            if (refs.current[i]) {
                refs.current[i].position.set(item.x, item.scale * 1.5, item.z);
            }
        });
    });

    return (
        <group>
            {items.map((item, i) => (
                <group key={i} ref={el => refs.current[i] = el}>
                    <mesh castShadow>
                        <boxGeometry args={[1, item.scale * 3, 1]} />
                        <meshStandardMaterial color={item.color} metalness={0.5} wireframe={Math.random() > 0.5} emissive={item.color} emissiveIntensity={0.4} />
                    </mesh>
                    <pointLight color={item.color} position={[0, item.scale, 0]} distance={10} intensity={0.5} />
                </group>
            ))}
        </group>
    );
};

const CameraRig = () => {
    const { camera } = useThree();

    useEffect(() => {
        if (camera) {
            gsap.fromTo(camera.position,
                { y: 20, z: 30 },
                { y: 3, z: 6, duration: 2, ease: "power3.out" }
            );
        }
    }, [camera]);

    useFrame((_, delta) => {
        if (state.isGameOver) return;
        // Dynamic camera based on boost and steering
        const targetX = state.carPosition.x * 0.4;
        const targetZ = state.isBoosting ? 8 : 6;
        const targetY = state.isBoosting ? 2.5 : 3.5;
        const targetFov = state.isBoosting ? 85 : 75;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 3);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 3);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 3);

        const lookX = state.carPosition.x * 0.2;
        camera.lookAt(lookX, 1, -20);

        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 3);
        camera.updateProjectionMatrix();
    });
    return null;
};

const Obstacles = ({ onGameOver, onCoinCollect }) => {
    // Mode impacts density
    const obsCount = state.mode === 'Time Attack' ? 5 : (state.mode === 'Endless' ? 15 : 25);
    const coinsCount = state.mode === 'Coin Collection' ? 30 : 15;

    const items = useMemo(() => Array.from({ length: obsCount }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * (ROAD_WIDTH - 4),
        z: -60 - Math.random() * ROAD_LENGTH,
        active: true,
        type: Math.random() > 0.4 ? '404' : 'traffic',
        color: ['#ef4444', '#f97316', '#a855f7'][Math.floor(Math.random() * 3)],
        speed: Math.random() * 10 + 15
    })), [state.mode]);

    const coins = useMemo(() => Array.from({ length: coinsCount }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * (ROAD_WIDTH - 4),
        z: -30 - Math.random() * ROAD_LENGTH,
        active: true
    })), [state.mode]);

    const obsRefs = useRef([]);
    const coinRefs = useRef([]);

    useFrame((_, delta) => {
        if (state.isGameOver) return;

        // Obstacles logic
        items.forEach((obs, i) => {
            if (!obs.active) return;
            const diffSpeed = state.speed - (obs.type === 'traffic' ? obs.speed : 0);
            obs.z += diffSpeed * delta;

            if (obs.z > 10) {
                obs.z = -50 - Math.random() * 150;
                obs.x = (Math.random() - 0.5) * (ROAD_WIDTH - 4);
                state.score += 15;
            }

            // Player collision
            if (obs.z > -2 && obs.z < 2) {
                if (Math.abs(obs.x - state.carPosition.x) < 1.6) {
                    // Explode or Game Over
                    onGameOver();
                }
            }
            if (obsRefs.current[i]) {
                obsRefs.current[i].position.set(obs.x, 0.5, obs.z);
            }
        });

        // Coins logic
        coins.forEach((coin, i) => {
            if (!coin.active) return;
            coin.z += state.speed * delta;

            if (coin.z > 5) {
                coin.z = -30 - Math.random() * 100;
                coin.x = (Math.random() - 0.5) * (ROAD_WIDTH - 4);
            }

            if (coin.z > -1.5 && coin.z < 1.5) {
                if (Math.abs(coin.x - state.carPosition.x) < 2) {
                    coin.z = -30 - Math.random() * 100; // instant respawn
                    coin.x = (Math.random() - 0.5) * (ROAD_WIDTH - 4);
                    onCoinCollect();
                }
            }

            if (coinRefs.current[i]) {
                coinRefs.current[i].rotation.y += delta * 3;
                coinRefs.current[i].position.set(coin.x, 1 + Math.sin(Date.now() * 0.005 + i) * 0.2, coin.z);
            }
        });
    });

    return (
        <group>
            {items.map((obs, i) => (
                <group key={`obs-${obs.id}`} ref={el => obsRefs.current[i] = el}>
                    {obs.type === '404' ? (
                        <group>
                            <mesh position={[0, 0.5, 0]} castShadow>
                                <boxGeometry args={[2.5, 1.5, 1.5]} />
                                <meshStandardMaterial color={obs.color} roughness={0.7} />
                            </mesh>
                            <Text position={[0, 1.8, 0]} fontSize={0.8} color="white" outlineWidth={0.05} outlineColor="#000">
                                404
                            </Text>
                        </group>
                    ) : (
                        <mesh position={[0, 0.3, 0]} castShadow>
                            <boxGeometry args={[1.5, 1.2, 3]} />
                            <meshStandardMaterial color="#334155" metalness={0.8} />
                            {/* Taillights */}
                            <mesh position={[0, 0.5, 1.51]}>
                                <boxGeometry args={[1, 0.2, 0.1]} />
                                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
                            </mesh>
                        </mesh>
                    )}
                </group>
            ))}

            {coins.map((coin, i) => (
                <group key={`coin-${coin.id}`} ref={el => coinRefs.current[i] = el} rotation={[Math.PI / 2, 0, 0]}>
                    <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
                        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} emissive="#fbbf24" emissiveIntensity={0.2} />
                    </mesh>
                    <Text position={[0, 0, 0.12]} fontSize={0.4} color="#fef3c7" fontStyle="bold">$</Text>
                </group>
            ))}
        </group>
    )
};

export default function RacingGame({ onQuit }) {
    const [uiState, setUiState] = useState({ score: 0, speed: 0, time: 60, coins: 0, over: false });
    const [mode, setMode] = useState('Endless');
    const [started, setStarted] = useState(false);

    // Setup and game loop polling
    useEffect(() => {
        if (!started) return;
        const cleanup = setupControls();
        const interval = setInterval(() => {
            if (state.isGameOver) return;

            state.distanceElapsed += (state.speed / 100);

            // Mode unique logic
            if (state.mode === 'Time Attack') {
                state.timeRemaining -= 0.1;
                if (state.timeRemaining <= 0) {
                    state.isGameOver = true;
                }
            }
            if (state.mode === 'Coin Collection' && state.coinsCollected >= 50) {
                state.isGameOver = true; // Win condition handled via gameOver UI
            }

            setUiState({
                score: Math.floor(state.score + state.distanceElapsed * 10),
                speed: Math.floor(state.speed),
                time: Math.ceil(state.timeRemaining),
                coins: state.coinsCollected,
                over: state.isGameOver
            });
        }, 100);

        return () => {
            cleanup();
            clearInterval(interval);
        };
    }, [started]);

    const handleStart = (m) => {
        state.isGameOver = false;
        state.speed = 0;
        state.score = 0;
        state.distanceElapsed = 0;
        state.coinsCollected = 0;
        state.timeRemaining = 60;
        state.carPosition.set(0, 0, 0);
        state.carVelocity.set(0, 0, 0);
        state.mode = m;
        setMode(m);
        setUiState({ score: 0, speed: 0, time: 60, coins: 0, over: false });
        setStarted(true);
    };

    const handleGameOver = () => {
        state.isGameOver = true;
        setUiState(prev => ({ ...prev, over: true }));
    };

    const handleCoinCollect = () => {
        state.coinsCollected += 1;
        state.score += 50;
    };

    return (
        <div className="w-full h-full relative cursor-crosshair">
            {!started ? (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-white">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 uppercase tracking-widest text-center shadow-black drop-shadow-lg">
                        Cyber Racer 404
                    </h2>
                    <p className="text-slate-400 mb-8 max-w-md text-center">
                        Page not found… but enjoy the race! Use <span className="text-blue-400 font-bold">Arrow Keys / WASD</span> to drive. Space to <span className="text-blue-400 font-bold">Boost</span>. Avoid 404 blocks and traffic.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <button onClick={() => handleStart('Endless')} className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-indigo-600/50 rounded-xl border border-indigo-500/30 transition-all font-bold">
                            <Trophy size={28} className="text-indigo-400" />
                            Endless
                        </button>
                        <button onClick={() => handleStart('Time Attack')} className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-rose-600/50 rounded-xl border border-rose-500/30 transition-all font-bold">
                            <Clock size={28} className="text-rose-400" />
                            Time Attack
                        </button>
                        <button onClick={() => handleStart('Coin Collection')} className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-amber-600/50 rounded-xl border border-amber-500/30 transition-all font-bold">
                            <Coins size={28} className="text-amber-400" />
                            Coin Run
                        </button>
                    </div>

                    <button onClick={onQuit} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 py-2 px-6 rounded-lg hover:bg-white/10">
                        <ArrowLeft size={18} /> Exit Game
                    </button>
                </div>
            ) : (
                <>
                    {/* UI Overlay */}
                    <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-start pointer-events-none">
                        <div className="flex flex-col gap-2">
                            <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-lg flex items-center gap-3">
                                <Trophy size={18} className="text-indigo-400" />
                                <span className="font-mono text-xl font-bold text-white">{uiState.score}</span>
                            </div>
                            <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-lg flex items-center gap-3">
                                <Coins size={18} className="text-amber-400" />
                                <span className="font-mono font-bold text-white">{uiState.coins} {mode === 'Coin Collection' && '/ 50'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                            <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-lg flex items-center gap-3">
                                <span className="font-mono text-xl font-bold text-white">{uiState.speed} km/h</span>
                                <Zap size={18} className={`${uiState.speed > BASE_SPEED ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
                            </div>
                            {mode === 'Time Attack' && (
                                <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-rose-500/40 backdrop-blur-md shadow-lg flex items-center gap-3 text-rose-400">
                                    <Clock size={16} />
                                    <span className="font-mono font-bold">{uiState.time}s</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Game Over Modal */}
                    {uiState.over && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                            <div className="flex flex-col items-center p-8 bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.2)] max-w-sm w-full">
                                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-rose-600 mb-6 drop-shadow-lg text-center uppercase tracking-widest">
                                    {(mode === 'Coin Collection' && uiState.coins >= 50) ? 'Mission Complete' : (mode === 'Time Attack' && uiState.time <= 0 ? 'Time Up' : 'CRASHED!')}
                                </h3>

                                <div className="grid grid-cols-2 gap-4 w-full mb-8 text-center">
                                    <div className="bg-slate-800 p-3 rounded-lg border border-white/5">
                                        <p className="text-slate-400 text-xs font-bold mb-1">SCORE</p>
                                        <p className="text-2xl font-mono font-bold text-white">{uiState.score}</p>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded-lg border border-white/5">
                                        <p className="text-slate-400 text-xs font-bold mb-1">COINS</p>
                                        <p className="text-2xl font-mono font-bold text-amber-400">{uiState.coins}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 w-full">
                                    <button onClick={() => setStarted(false)} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:-translate-y-1">
                                        <RotateCcw size={18} /> Play Again
                                    </button>
                                    <button onClick={onQuit} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all">
                                        Return to Matrix
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Three.js Canvas */}
                    <Canvas shadows>
                        <PerspectiveCamera makeDefault position={[0, 3, 6]} fov={75} />
                        <color attach="background" args={['#020617']} />
                        <fog attach="fog" args={['#020617', 20, ROAD_LENGTH * 0.4]} />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />

                        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={2} />
                        <Sparkles count={100} scale={20} size={2} speed={0.4} opacity={0.5} />

                        <Suspense fallback={null}>
                            <Scenery />
                            <Road />
                            <PlayerCar />
                            <Obstacles onGameOver={handleGameOver} onCoinCollect={handleCoinCollect} />
                            <CameraRig />
                        </Suspense>
                    </Canvas>
                </>
            )}
        </div>
    );
}
