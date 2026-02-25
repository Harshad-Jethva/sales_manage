import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera, GradientTexture, Sparkles, Trail, Float as FloatDrei } from '@react-three/drei';
import * as THREE from 'three';

const ShootingStar = () => {
    const ref = useRef();
    const [start, end] = useMemo(() => {
        const s = new THREE.Vector3((Math.random() - 0.5) * 40, 20, -20);
        const e = new THREE.Vector3(s.x + 20, -10, -20);
        return [s, e];
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        const speed = 0.5;
        const time = (state.clock.elapsedTime % 4) / 4;
        ref.current.position.lerpVectors(start, end, time);
        ref.current.scale.setScalar(time < 0.1 ? time * 10 : time > 0.9 ? (1 - time) * 10 : 1);
        ref.current.visible = time < 0.95;
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#fff" />
        </mesh>
    );
}

const Mountain = ({ position, scale, color, opacity = 1 }) => {
    return (
        <mesh position={position} scale={scale}>
            <coneGeometry args={[1, 2, 4]} />
            <meshStandardMaterial
                color={color}
                flatShading
                transparent={opacity < 1}
                opacity={opacity}
            />
        </mesh>
    );
};

const House = () => {
    const doorLightRef = useRef();

    useFrame((state) => {
        if (doorLightRef.current) {
            // Flickering door light
            doorLightRef.current.intensity = 3 + Math.sin(state.clock.elapsedTime * 10) * 0.5;
        }
    });

    return (
        <group position={[2, -1.2, 0]}>
            <mesh position={[0, 0.4, -0.5]}>
                <boxGeometry args={[1.8, 1.2, 1]} />
                <meshStandardMaterial color="#2d1b4d" roughness={0.8} />
            </mesh>

            <mesh position={[-0.5, 0.6, 0.01]}>
                <planeGeometry args={[0.3, 0.3]} />
                <meshStandardMaterial emissive="#ffbb00" emissiveIntensity={0.5} color="#ffbb00" />
            </mesh>
            <mesh position={[0.5, 0.6, 0.01]}>
                <planeGeometry args={[0.3, 0.3]} />
                <meshStandardMaterial emissive="#ffbb00" emissiveIntensity={0.5} color="#ffbb00" />
            </mesh>

            <group position={[0, 0.2, 0]}>
                <mesh position={[0, 0, -0.05]}>
                    <planeGeometry args={[0.6, 1]} />
                    <meshStandardMaterial emissive="#fbbf24" emissiveIntensity={2} color="#fbbf24" />
                </mesh>
                <mesh position={[0, -0.6, 0.2]}>
                    <boxGeometry args={[1, 0.1, 0.4]} />
                    <meshStandardMaterial color="#1e1b4b" />
                </mesh>
                <mesh position={[0, -0.75, 0.4]}>
                    <boxGeometry args={[1.4, 0.1, 0.6]} />
                    <meshStandardMaterial color="#1e1b4b" />
                </mesh>
            </group>

            <mesh position={[0, -0.3, 0.5]} rotation={[-Math.PI / 2.2, 0, 0]}>
                <planeGeometry args={[0.6, 2]} />
                <meshBasicMaterial transparent opacity={0.3}>
                    <GradientTexture stops={[0, 1]} colors={['#fbbf24', 'transparent']} />
                </meshBasicMaterial>
            </mesh>

            <pointLight ref={doorLightRef} position={[0, 0.2, 0.5]} intensity={3} color="#ffbb00" distance={6} />
        </group>
    );
}

const Aurora = () => {
    const ref = useRef();
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <group ref={ref} position={[0, 5, -8]}>
            <mesh scale={[30, 10, 1]}>
                <planeGeometry />
                <meshBasicMaterial transparent opacity={0.1}>
                    <GradientTexture stops={[0, 0.5, 1]} colors={['transparent', '#4c1d95', 'transparent']} />
                </meshBasicMaterial>
            </mesh>
        </group>
    );
}

const Scene = () => {
    const { mouse } = useThree();
    const sceneRef = useRef();

    useFrame((state) => {
        if (sceneRef.current) {
            sceneRef.current.rotation.y = THREE.MathUtils.lerp(sceneRef.current.rotation.y, mouse.x * 0.1, 0.1);
            sceneRef.current.rotation.x = THREE.MathUtils.lerp(sceneRef.current.rotation.x, -mouse.y * 0.1, 0.1);
        }
    });

    return (
        <group ref={sceneRef}>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            <ambientLight intensity={0.1} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#c084fc" />

            <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
            <Sparkles count={80} scale={15} size={3} speed={0.6} opacity={0.3} color="#fcd34d" />

            <ShootingStar />
            <Aurora />

            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
                <group>
                    <Mountain position={[-8, -1, -5]} scale={[5, 10, 5]} color="#1e1b4b" opacity={0.6} />
                    <Mountain position={[1, -1, -8]} scale={[7, 14, 7]} color="#0f172a" opacity={0.4} />
                    <Mountain position={[10, -1, -6]} scale={[6, 9, 6]} color="#1e1b4b" opacity={0.5} />
                    <Mountain position={[-4, -1.5, -2]} scale={[3, 5, 3]} color="#312e81" />
                    <House />
                </group>
            </Float>

            <mesh position={[0, 0, -12]} scale={[70, 70, 1]}>
                <planeGeometry />
                <meshBasicMaterial>
                    <GradientTexture stops={[0, 0.3, 0.7, 1]} colors={['#020617', '#1e1b4b', '#4c1d95', '#1e1b4b']} />
                </meshBasicMaterial>
            </mesh>
        </group>
    );
};

const Background3D = () => {
    return (
        <div className="absolute inset-0 z-0 bg-[#020617]">
            <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 2]}>
                <Scene />
            </Canvas>
        </div>
    );
};

export default Background3D;
