import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Card } from "@/components/ui/card";

interface Model3DViewerProps {
  modelUrl?: string;
  className?: string;
}

function Model({ url }: { url: string }) {
  try {
    const { scene } = useGLTF(url);
    return <primitive object={scene} scale={1.5} />;
  } catch (error) {
    console.error("Error loading 3D model:", error);
    return null;
  }
}

function FallbackMesh() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#00d4ff" 
        metalness={0.6} 
        roughness={0.4}
      />
    </mesh>
  );
}

export const Model3DViewer = ({ modelUrl, className }: Model3DViewerProps) => {
  return (
    <Card className={`bg-gradient-to-br from-card via-card to-primary/5 border-2 overflow-hidden ${className}`}>
      <div className="relative w-full h-[400px] md:h-[500px]">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow
          />
          <spotLight
            position={[-10, 10, -10]}
            angle={0.3}
            penumbra={1}
            intensity={0.5}
            castShadow
          />
          
          {/* Environment for reflections */}
          <Environment preset="studio" />
          
          {/* 3D Model or Fallback */}
          <Suspense fallback={<FallbackMesh />}>
            {modelUrl ? (
              <Model url={modelUrl} />
            ) : (
              <FallbackMesh />
            )}
          </Suspense>
          
          {/* Ground plane with shadow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.2} />
          </mesh>
          
          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
        </Canvas>
        
        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-xs text-muted-foreground">
          <p className="text-center">
            <span className="font-semibold">🖱️ Drag</span> to rotate • 
            <span className="font-semibold"> 🔍 Scroll</span> to zoom • 
            <span className="font-semibold"> 👆 Right-click</span> to pan
          </p>
        </div>
      </div>
    </Card>
  );
};