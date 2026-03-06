import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField(props) {
    const ref = useRef();
    const [sphere] = useState(() => {
        const coords = new Float32Array(5000 * 3);
        for (let i = 0; i < 5000; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = 1.2 + Math.random() * 0.5; // Radius
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            coords[i * 3] = x;
            coords[i * 3 + 1] = y;
            coords[i * 3 + 2] = z;
        }
        return coords;
    });

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#60a5fa"
                    size={0.002}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

function FloatingCube({ position, color, speed }) {
    const mesh = useRef();

    useFrame((state, delta) => {
        mesh.current.rotation.x += delta * speed;
        mesh.current.rotation.y += delta * speed;
        mesh.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.002;
    });

    return (
        <mesh ref={mesh} position={position}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color={color} wireframe opacity={0.3} transparent />
        </mesh>
    );
}

const ThreeBackground = () => {
    return (
        <div className="three-bg-wrapper">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <fog attach="fog" args={['#0f172a', 0.5, 2.5]} />
                <ambientLight intensity={0.5} />
                <StarField />

                {/* Floating Abstract Shapes */}
                <FloatingCube position={[-2, 0, -2]} color="#6366f1" speed={0.5} />
                <FloatingCube position={[2, 1, -3]} color="#ec4899" speed={0.3} />
                <FloatingCube position={[0, -2, -1]} color="#3b82f6" speed={0.4} />

            </Canvas>
            <style>{`
        .three-bg-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1; /* Behind everything */
            background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
            overflow: hidden;
            pointer-events: none;
        }
      `}</style>
        </div>
    );
};

export default ThreeBackground;
