import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, PerspectiveCamera, Environment, MeshDistortMaterial, Cone, Box, Sphere, GradientTexture, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Mountain = ({ position, scale, color }) => {
    return (
        <mesh position={position} scale={scale}>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

const Tree = ({ position, scale }) => {
    return (
        <group position={position} scale={scale}>
            <mesh position={[0, 0.5, 0]}>
                <coneGeometry args={[0.3, 1, 8]} />
                <MeshWobbleMaterial factor={0.2} speed={1} color="#1e1b4b" />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                <meshStandardMaterial color="#0f172a" />
            </mesh>
        </group>
    );
};

const House = () => {
    const houseRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        houseRef.current.position.y = -0.5 + Math.sin(t * 0.5) * 0.05;
    });

    return (
        <group ref={houseRef} position={[1.5, -0.5, 1]} rotation={[0, -Math.PI / 6, 0]}>
            {/* Main Body */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1.5, 1, 1]} />
                <meshStandardMaterial color="#4338ca" />
            </mesh>
            {/* Open Door Area (Glowing) */}
            <mesh position={[-0.76, 0.4, 0]}>
                <planeGeometry args={[0.5, 0.8]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={5} />
            </mesh>
            <pointLight position={[-1, 0.5, 0]} color="#fbbf24" intensity={2} distance={3} />

            {/* Windows */}
            {[...Array(2)].map((_, i) => (
                <mesh key={i} position={[0.2 + i * 0.4, 0.6, 0.51]}>
                    <planeGeometry args={[0.2, 0.3]} />
                    <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} />
                </mesh>
            ))}
            {/* Roof */}
            <mesh position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[1.2, 0.5, 4]} />
                <meshStandardMaterial color="#312e81" />
            </mesh>
        </group>
    );
};

const Moon = () => {
    const moonRef = useRef();
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        moonRef.current.position.y = 2.5 + Math.sin(t * 0.3) * 0.1;
    });

    return (
        <group ref={moonRef} position={[3, 2.5, -2]}>
            <Sphere args={[0.6, 32, 32]}>
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
            </Sphere>
            <pointLight intensity={15} color="#ffffff" distance={20} />
        </group>
    );
};

const Scene = () => {
    const groupRef = useRef();

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[-10, 10, 10]} intensity={1} />

            <group ref={groupRef}>
                {/* Background Sphere for Sky Gradient */}
                <mesh scale={[20, 20, 20]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial side={THREE.BackSide}>
                        <GradientTexture
                            stops={[0, 0.5, 1]}
                            colors={['#0f172a', '#1e1b4b', '#312e81']}
                            size={1024}
                        />
                    </meshBasicMaterial>
                </mesh>

                {/* Background Mountains */}
                <Mountain position={[-3, -0.5, -4]} scale={[6, 8, 1]} color="#1e1b4b" />
                <Mountain position={[0, -0.5, -6]} scale={[8, 10, 1]} color="#0f172a" />
                <Mountain position={[4, -0.5, -5]} scale={[7, 9, 1]} color="#1e1b4b" />

                {/* Ground */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                    <planeGeometry args={[30, 30]} />
                    <meshStandardMaterial color="#0f172a" />
                </mesh>

                {/* Path */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, -0.99, 2]} scale={[1, 2, 1]}>
                    <planeGeometry args={[0.6, 5]} />
                    <meshStandardMaterial color="#4f46e5" transparent opacity={0.3} emissive="#4f46e5" emissiveIntensity={0.5} />
                </mesh>

                {/* Trees */}
                <Tree position={[-2, -0.5, 1]} scale={[1, 1.2, 1]} />
                <Tree position={[-1.5, -0.5, -1]} scale={[0.8, 1, 0.8]} />
                <Tree position={[-3.5, -0.5, 0]} scale={[1.1, 1.3, 1.1]} />
                <Tree position={[2.8, -0.5, 0.5]} scale={[1.2, 1.5, 1.2]} />
                <Tree position={[3.8, -0.5, -1]} scale={[0.9, 1.1, 0.9]} />

                <House />
                <Moon />

                <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
            </group>

            <fog attach="fog" args={['#0f172a', 5, 20]} />
        </>
    );
};

const LoginBackground = () => {
    return (
        <div className="canvas-container">
            <Canvas shadows gl={{ antialias: true }}>
                <Scene />
            </Canvas>
        </div>
    );
};

export default LoginBackground;
