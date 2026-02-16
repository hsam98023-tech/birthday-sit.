'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface WishExplosionProps {
  trigger: boolean;
  onComplete: () => void;
}

export default function WishExplosion({ trigger, onComplete }: WishExplosionProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>();
  
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    
    const goldColor = new THREE.Color('#D4AF37');
    const pinkColor = new THREE.Color('#FFD1DC');
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Start from center
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;
      
      // Random velocity in all directions
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const speed = Math.random() * 3 + 2;
      
      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i3 + 2] = Math.cos(phi) * speed;
      
      // Color variation
      const color = Math.random() > 0.5 ? goldColor : pinkColor;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = Math.random() * 0.15 + 0.05;
    }
    
    velocitiesRef.current = velocities;
    
    const geometry = particlesRef.current.geometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
  }, []);
  
  useEffect(() => {
    if (trigger && particlesRef.current) {
      const material = particlesRef.current.material as THREE.PointsMaterial;
      
      // Fade in explosion
      gsap.to(material, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      
      // Fade out after explosion
      gsap.to(material, {
        opacity: 0,
        duration: 2,
        delay: 1.5,
        ease: 'power2.in',
        onComplete,
      });
    }
  }, [trigger, onComplete]);
  
  useFrame((state, delta) => {
    if (!particlesRef.current || !velocitiesRef.current || !trigger) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = velocitiesRef.current;
    
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i] * delta;
      positions[i + 1] += velocities[i + 1] * delta;
      positions[i + 2] += velocities[i + 2] * delta;
      
      // Gravity
      velocities[i + 1] -= 2 * delta;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
