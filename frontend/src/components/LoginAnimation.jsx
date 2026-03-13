import React, { useRef, useEffect, useMemo, useState, forwardRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, Sphere, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const Character = forwardRef(({ position, color, rotation = [0, 0, 0], scale = 1, status }, ref) => {
    const groupRef = useRef();
    const mouthRef = useRef();
    const eyeLRef = useRef();
    const eyeRRef = useRef();

    // Use the passed ref or internal if none
    const actualRef = ref || groupRef;

    // Idle animation
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (actualRef.current) {
            actualRef.current.position.y = position[1] + Math.sin(t * 1.5 + position[0]) * 0.05;
            actualRef.current.rotation.x = rotation[0] + Math.sin(t * 1.5) * 0.02;
        }
    });

    useEffect(() => {
        if (status === 'success') {
            gsap.to(actualRef.current.scale, { x: 1.15 * scale, y: 1.15 * scale, z: 1.15 * scale, duration: 0.3, yoyo: true, repeat: 3 });
            gsap.to(mouthRef.current.scale, { y: 2, duration: 0.2 });
        } else if (status === 'failure') {
            gsap.to(actualRef.current.rotation, { z: 0.1, duration: 0.05, yoyo: true, repeat: 7 });
            gsap.to(mouthRef.current.scale, { y: -0.5, duration: 0.2 });
            gsap.to([eyeLRef.current.scale, eyeRRef.current.scale], { y: 0.1, duration: 0.1, yoyo: true, repeat: 5 });
        } else {
            if (actualRef.current) {
                gsap.to(mouthRef.current.scale, { y: 1, duration: 0.2 });
                gsap.to([eyeLRef.current.scale, eyeRRef.current.scale], { y: 1, duration: 0.2 });
            }
        }
    }, [status, scale]);

    return (
        <group ref={actualRef} position={position} rotation={rotation} scale={scale}>
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
                <sphereGeometry args={[0.45, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            
            <group position={[0, 0.1, 0.4]}>
                <mesh ref={eyeLRef} position={[-0.15, 0.05, 0]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshBasicMaterial color="#1e293b" />
                </mesh>
                <mesh ref={eyeRRef} position={[0.15, 0.05, 0]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshBasicMaterial color="#1e293b" />
                </mesh>
                <mesh ref={mouthRef} position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[0.02, 0.1, 8, 8]} />
                    <meshBasicMaterial color="#1e293b" />
                </mesh>
            </group>

            <mesh position={[-0.45, -0.1, 0.2]} rotation={[0, 0.5, 0]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            <mesh position={[0.45, -0.1, 0.2]} rotation={[0, -0.5, 0]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>

            <mesh position={[-0.4, 0.2, -0.3]} rotation={[0, -0.8, 0.2]}>
                <sphereGeometry args={[0.2, 16, 8]} scale={[1, 0.6, 0.1]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>
            <mesh position={[0.4, 0.2, -0.3]} rotation={[0, 0.8, -0.2]}>
                <sphereGeometry args={[0.2, 16, 8]} scale={[1, 0.6, 0.1]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>
        </group>
    );
});

const ConnectionGroup = forwardRef(({ status, onComplete }, ref) => {
    const plugRef = useRef();
    const socketRef = useRef();
    const sparkRef = useRef();
    const lightRef = useRef();
    const groupRef = useRef();

    // Expose refs to parent
    React.useImperativeHandle(ref, () => ({
        plug: plugRef.current,
        socket: socketRef.current,
        group: groupRef.current
    }));

    useEffect(() => {
        if (status === 'success') {
            const tl = gsap.timeline({
                onComplete: () => {
                    if (onComplete) onComplete();
                }
            });
            
            tl.to(plugRef.current.position, {
                y: 0.1,
                duration: 0.8,
                ease: "back.in(1.2)"
            })
            .to(plugRef.current.position, {
                y: 0,
                duration: 0.1,
                ease: "power4.out"
            })
            .to(sparkRef.current.scale, {
                x: 1, y: 1, z: 1, duration: 0.1
            })
            .to(lightRef.current, {
                intensity: 5, duration: 0.1
            }, "<")
            .to(sparkRef.current.scale, {
                x: 0, y: 0, z: 0, duration: 0.4, ease: "power2.in"
            })
            .to(lightRef.current, {
                intensity: 0, duration: 0.4
            }, "<");

        } else if (status === 'failure') {
            const tl = gsap.timeline();
            
            tl.to(plugRef.current.position, {
                y: 0.1,
                duration: 0.4,
                ease: "power2.in"
            })
            .to(plugRef.current.position, {
                y: 1.2,
                duration: 0.6,
                ease: "bounce.out"
            })
            .to(groupRef.current.rotation, {
                z: 0.1, duration: 0.05, yoyo: true, repeat: 5
            });
            
            gsap.delayedCall(2, () => {
                if (plugRef.current) gsap.to(plugRef.current.position, { y: 1, duration: 0.5 });
            });

        } else {
            if (plugRef.current) {
                gsap.to(plugRef.current.position, { y: 1, duration: 0.5 });
                gsap.to(groupRef.current.rotation, { z: 0, duration: 0.5 });
            }
        }
    }, [status]);

    return (
        <group ref={groupRef} position={[0, -0.2, 0]}>
            <group ref={socketRef} position={[0, -0.5, 0]}>
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.4, 0.45, 0.6, 32]} />
                    <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.1} />
                </mesh>
                <mesh position={[0, 0.3, 0]}>
                    <cylinderGeometry args={[0.35, 0.35, 0.02, 32]} />
                    <meshStandardMaterial color="#d97706" />
                </mesh>
                <mesh position={[-0.12, 0.31, 0]}>
                    <circleGeometry args={[0.04, 16]} rotation={[-Math.PI / 2, 0, 0]} />
                    <meshBasicMaterial color="#451a03" />
                </mesh>
                <mesh position={[0.12, 0.31, 0]}>
                    <circleGeometry args={[0.04, 16]} rotation={[-Math.PI / 2, 0, 0]} />
                    <meshBasicMaterial color="#451a03" />
                </mesh>
            </group>

            <group ref={plugRef} position={[0, 1, 0]}>
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.35, 0.35, 0.5, 32]} />
                    <meshStandardMaterial color="#1e3a8a" roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.25, 0]}>
                    <sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#1e3a8a" />
                </mesh>
                <mesh position={[-0.12, -0.35, 0]} castShadow>
                    <cylinderGeometry args={[0.035, 0.035, 0.25, 16]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0.12, -0.35, 0]} castShadow>
                    <cylinderGeometry args={[0.035, 0.035, 0.25, 16]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 0.45, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
            </group>

            <mesh ref={sparkRef} position={[0, -0.2, 0]} scale={[0, 0, 0]}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshBasicMaterial color="#fde047" transparent opacity={0.6} />
            </mesh>
            <pointLight ref={lightRef} position={[0, -0.2, 0.5]} intensity={0} color="#fde047" distance={3} />
        </group>
    );
});

const DynamicCable = ({ startRef, endRef, startOffset = [0, 0, 0], endOffset = [0, 0, 0], sag = 0.5 }) => {
    const meshRef = useRef();
    const curve = useMemo(() => new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()), []);

    useFrame(() => {
        if (startRef.current && endRef.current && meshRef.current) {
            const p1 = new THREE.Vector3().set(...startOffset);
            startRef.current.localToWorld(p1);
            
            const p2 = new THREE.Vector3().set(...endOffset);
            endRef.current.localToWorld(p2);

            const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            mid.y -= sag;

            curve.v0.copy(p1);
            curve.v1.copy(mid);
            curve.v2.copy(p2);

            // Dispose old geometry to prevent leaks. Note: re-rendering geometry every frame is heavy, but fine for 2 cables.
            if (meshRef.current.geometry) meshRef.current.geometry.dispose();
            meshRef.current.geometry = new THREE.TubeGeometry(curve, 16, 0.035, 8, false);
        }
    });

    return (
        <mesh ref={meshRef}>
            <meshStandardMaterial color="#334155" roughness={0.3} />
        </mesh>
    );
};

const Scene = ({ status, onAnimationComplete }) => {
    const char1Ref = useRef();
    const char2Ref = useRef();
    const connectGroupRef = useRef();
    
    // We need to wait for refs to be available for the cable
    const [refsReady, setRefsReady] = useState(false);
    useEffect(() => {
        if (char1Ref.current && char2Ref.current && connectGroupRef.current) {
            setRefsReady(true);
        }
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0.5, 6]} fov={45} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#60a5fa" />
            
            <Character 
                ref={char1Ref}
                position={[-1.8, 0.8, 0]} 
                color="#60a5fa" 
                rotation={[0, 0.4, 0]} 
                scale={1.1}
                status={status} 
            />
            <Character 
                ref={char2Ref}
                position={[1.8, -1, 0]} 
                color="#60a5fa" 
                rotation={[0, -0.4, 0]} 
                scale={1.1}
                status={status} 
            />

            <ConnectionGroup 
                ref={connectGroupRef}
                status={status} 
                onComplete={onAnimationComplete}
            />

            {/* Cables connecting to hands */}
            {refsReady && (
                <>
                    {/* Cable from Char 1 Right Hand to Plug Top */}
                    <DynamicCable 
                        startRef={char1Ref} 
                        endRef={{ current: connectGroupRef.current.plug }}
                        startOffset={[0.45, -0.1, 0.2]}
                        endOffset={[0, 0.6, 0]}
                        sag={0.4}
                    />
                    {/* Cable from Char 2 Left Hand to Socket Bottom */}
                    <DynamicCable 
                        startRef={char2Ref} 
                        endRef={{ current: connectGroupRef.current.socket }}
                        startOffset={[-0.45, -0.1, 0.2]}
                        endOffset={[0, -0.6, 0]}
                        sag={0.4}
                    />
                </>
            )}

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Sphere args={[15, 32, 32]} position={[0, 0, -10]}>
                    <meshStandardMaterial color="#dbeafe" side={THREE.BackSide} roughness={1} />
                </Sphere>
            </Float>

            <ContactShadows position={[0, -2, 0]} opacity={0.3} scale={10} blur={2.5} far={4} />
            <Environment preset="city" />
        </>
    );
};

const LoginAnimation = ({ status, onAnimationComplete }) => {
    return (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                <Scene status={status} onAnimationComplete={onAnimationComplete} />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
            </Canvas>
        </div>
    );
};

export default LoginAnimation;
