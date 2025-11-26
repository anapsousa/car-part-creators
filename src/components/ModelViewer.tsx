import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { Loader2 } from "lucide-react";
import { GLTFLoader } from "three-stdlib";
import { STLLoader } from "three-stdlib";
import * as THREE from "three";

interface ModelViewerProps {
  modelUrl: string;
}

const Model = ({ modelUrl }: { modelUrl: string }) => {
  const [model, setModel] = useState<THREE.Group | THREE.Mesh | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const fileExtension = modelUrl.split('.').pop()?.toLowerCase();
        
        if (fileExtension === 'glb' || fileExtension === 'gltf') {
          const loader = new GLTFLoader();
          loader.load(
            modelUrl,
            (gltf) => {
              setModel(gltf.scene);
            },
            undefined,
            (err) => {
              console.error('Error loading GLB:', err);
              setError('Failed to load model');
            }
          );
        } else if (fileExtension === 'stl') {
          const loader = new STLLoader();
          loader.load(
            modelUrl,
            (geometry) => {
              const material = new THREE.MeshStandardMaterial({ 
                color: '#6366f1',
                metalness: 0.3,
                roughness: 0.4
              });
              const mesh = new THREE.Mesh(geometry, material);
              
              // Center and scale the model
              geometry.computeBoundingBox();
              const boundingBox = geometry.boundingBox!;
              const center = new THREE.Vector3();
              boundingBox.getCenter(center);
              mesh.geometry.translate(-center.x, -center.y, -center.z);
              
              setModel(mesh);
            },
            undefined,
            (err) => {
              console.error('Error loading STL:', err);
              setError('Failed to load model');
            }
          );
        }
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Failed to load model');
      }
    };

    if (modelUrl) {
      loadModel();
    }
  }, [modelUrl]);

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    );
  }

  if (!model) return null;

  return <primitive object={model} />;
};

const ModelViewer = ({ modelUrl }: ModelViewerProps) => {
  return (
    <div className="w-full h-[400px] bg-card rounded-lg border border-border/50 overflow-hidden relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Model modelUrl={modelUrl} />
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
    </div>
  );
};

export default ModelViewer;
