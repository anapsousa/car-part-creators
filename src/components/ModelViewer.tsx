import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { Loader2 } from "lucide-react";

interface ModelViewerProps {
  modelUrl: string;
}

const ModelViewer = ({ modelUrl }: ModelViewerProps) => {
  return (
    <div className="w-full h-[400px] bg-card rounded-lg border border-border/50 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            {/* Note: STL loader would need additional setup */}
            {/* For now showing a placeholder until STL loading is implemented */}
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#6366f1" />
            </mesh>
          </Stage>
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground">3D Preview Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;
