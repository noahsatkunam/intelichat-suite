import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  
  // Generate random positions for particles
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    
    for (let i = 0; i < 3000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.03) * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#6366f1"
        size={0.005}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FloatingGeometry() {
  const meshRef = useRef<THREE.Group>(null!);
  
  const geometries = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 30; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ] as [number, number, number],
        scale: Math.random() * 0.3 + 0.1,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number]
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.2;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
      
      meshRef.current.children.forEach((child, i) => {
        const t = state.clock.elapsedTime + i;
        child.position.y += Math.sin(t * 0.5) * 0.001;
        child.rotation.x += 0.01;
        child.rotation.z += 0.005;
      });
    }
  });

  return (
    <group ref={meshRef}>
      {geometries.map((props, i) => (
        <mesh key={i} position={props.position} scale={props.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

function AnimatedBackground() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <ParticleField />
      <FloatingGeometry />
      
      {/* Additional atmospheric layer */}
      <mesh position={[0, 0, -5]} scale={[20, 20, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#1a1a2e"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

export function DarkVeilBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5] }}
        gl={{ 
          antialias: false, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 5, 15]} />
        
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#8b5cf6" />
        
        <AnimatedBackground />
      </Canvas>
    </div>
  );
}