'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Cylinder, Sphere } from '@react-three/drei';

interface CandleProps {
  position: [number, number, number];
  isLit: boolean;
  index: number;
}

function Candle({ position, isLit, index }: CandleProps) {
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  const flameShader = useMemo(() => ({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorHot;
      uniform vec3 uColorCool;
      varying vec2 vUv;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      
      void main() {
        vec2 uv = vUv;
        float flameShape = 1.0 - smoothstep(0.0, 1.0, length(uv - vec2(0.5, 0.3)) * 2.0);
        float n = noise(uv * 8.0 + vec2(uTime * 0.5, uTime * -1.5));
        n += noise(uv * 16.0 + vec2(uTime * 0.8, uTime * -2.0)) * 0.5;
        float flame = flameShape * (0.8 + n * 0.4);
        flame *= smoothstep(0.0, 0.3, uv.y);
        flame *= smoothstep(1.0, 0.6, uv.y);
        vec3 color = mix(uColorCool, uColorHot, flame);
        float alpha = flame * (0.7 + sin(uTime * 3.0) * 0.15);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColorHot: { value: new THREE.Color('#FFA500') },
      uColorCool: { value: new THREE.Color('#FFD700') },
    }
  }), []);
  
  useFrame((state) => {
    if (flameRef.current && isLit) {
      const material = flameRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Flame flicker
      const flicker = Math.sin(state.clock.elapsedTime * 10 + index) * 0.02;
      flameRef.current.scale.setScalar(1 + flicker);
    }
    
    if (lightRef.current && isLit) {
      const flicker = Math.sin(state.clock.elapsedTime * 8 + index) * 0.2;
      lightRef.current.intensity = 2 + flicker;
    }
  });
  
  return (
    <group position={position}>
      {/* Candle body */}
      <Cylinder args={[0.05, 0.05, 0.4, 16]}>
        <meshStandardMaterial color="#FFF8DC" />
      </Cylinder>
      
      {/* Wick */}
      <Cylinder args={[0.01, 0.01, 0.1, 8]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      
      {/* Flame */}
      {isLit && (
        <>
          <mesh ref={flameRef} position={[0, 0.4, 0]}>
            <planeGeometry args={[0.15, 0.25]} />
            <shaderMaterial
              {...flameShader}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Point light for glow */}
          <pointLight
            ref={lightRef}
            position={[0, 0.4, 0]}
            color="#FFA500"
            intensity={2}
            distance={2}
            decay={2}
          />
        </>
      )}
    </group>
  );
}

interface BirthdayCakeProps {
  candlesLit: boolean[];
}

export default function BirthdayCake({ candlesLit }: BirthdayCakeProps) {
  const cakeRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (cakeRef.current) {
      // Subtle rotation
      cakeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });
  
  // Candle positions in a circle
  const candlePositions: [number, number, number][] = useMemo(() => {
    const radius = 0.8;
    const count = 6;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return [
        Math.cos(angle) * radius,
        1.2,
        Math.sin(angle) * radius
      ];
    });
  }, []);
  
  return (
    <group ref={cakeRef}>
      {/* Base layer */}
      <Cylinder args={[1.2, 1.2, 0.6, 32]} position={[0, -0.3, 0]}>
        <meshStandardMaterial
          color="#FFD1DC"
          metalness={0.1}
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Middle layer */}
      <Cylinder args={[0.9, 0.9, 0.5, 32]} position={[0, 0.25, 0]}>
        <meshStandardMaterial
          color="#FFB6C1"
          metalness={0.1}
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Top layer */}
      <Cylinder args={[0.7, 0.7, 0.4, 32]} position={[0, 0.7, 0]}>
        <meshStandardMaterial
          color="#FFC0CB"
          metalness={0.1}
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Frosting details */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const radius = 1.2;
        return (
          <Sphere
            key={i}
            args={[0.08, 16, 16]}
            position={[
              Math.cos(angle) * radius,
              -0.6,
              Math.sin(angle) * radius
            ]}
          >
            <meshStandardMaterial
              color="#FFFFFF"
              metalness={0.2}
              roughness={0.2}
            />
          </Sphere>
        );
      })}
      
      {/* Candles */}
      {candlePositions.map((pos, i) => (
        <Candle
          key={i}
          position={pos}
          isLit={candlesLit[i]}
          index={i}
        />
      ))}
    </group>
  );
}
