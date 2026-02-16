'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  Environment, 
  Float, 
  SpotLight,
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import CinematicParticles from './CinematicParticles';
import CinematicText from './CinematicText';
import BirthdayCake from './BirthdayCake';
import CameraRig from './CameraRig';
import WishExplosion from './WishExplosion';

interface SceneProps {
  activeScene: number;
  candlesLit: boolean[];
  explosionTriggered?: boolean;
}

function SceneContent({ activeScene, candlesLit, explosionTriggered = false }: SceneProps) {
  return (
    <>
      {/* Camera control */}
      <CameraRig activeScene={activeScene} />
      
      {/* Cinematic lighting */}
      <ambientLight intensity={0.2} />
      
      <SpotLight
        position={[5, 8, 5]}
        angle={0.5}
        penumbra={1}
        intensity={1.5}
        castShadow
        color="#FFD1DC"
      />
      
      <SpotLight
        position={[-5, 8, -5]}
        angle={0.5}
        penumbra={1}
        intensity={1}
        color="#D4AF37"
      />
      
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFFFFF" />
      
      {/* Scene 1: Cinematic entrance */}
      {activeScene === 0 && (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <CinematicText
            text="Hiba 💗"
            position={[0, 0, 0]}
            size={0.8}
            color="#FFD1DC"
          />
        </Float>
      )}
      
      {/* Scene 2 & 3: Birthday cake */}
      {(activeScene === 1 || activeScene === 2) && (
        <BirthdayCake candlesLit={candlesLit} />
      )}
      
      {/* Wish explosion effect */}
      {explosionTriggered && (
        <WishExplosion 
          trigger={explosionTriggered} 
          onComplete={() => {}} 
        />
      )}
      
      {/* Atmospheric particles */}
      <CinematicParticles />
      
      {/* Environment */}
      <Environment preset="city" />
      
      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
        />
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={3}
        />
        <Vignette
          offset={0.3}
          darkness={0.5}
        />
      </EffectComposer>
    </>
  );
}

export default function Scene({ activeScene, candlesLit, explosionTriggered = false }: SceneProps) {
  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2, 12], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <SceneContent 
            activeScene={activeScene} 
            candlesLit={candlesLit}
            explosionTriggered={explosionTriggered}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
