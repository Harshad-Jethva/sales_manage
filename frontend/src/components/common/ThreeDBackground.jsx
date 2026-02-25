import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = () => {
    const ref = useRef();

    // Create a sphere of random points
    const points = useMemo(() => {
        const p = new Float32Array(3000 * 3);
        for (let i = 0; i < 3000; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 5 + Math.random() * 15;
            p[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            p[i * 3 + 2] = radius * Math.cos(phi);
        }
        return p;
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#00f0ff"
                    size={0.03}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    opacity={0.3}
                />
            </Points>
        </group>
    );
};

const ConnectingLines = () => {
    // A simple network-like mesh
    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
            <mesh>
                <icosahedronGeometry args={[4, 1]} />
                <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.05} />
            </mesh>
        </Float>
    );
};

const ThreeDBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#090b14]">
            <Canvas camera={{ position: [0, 0, 10] }}>
                <ambientLight intensity={0.5} />
                <ParticleField />
                <ConnectingLines />
            </Canvas>
        </div>
    );
};

export default ThreeDBackground;
