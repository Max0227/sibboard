import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";

// ============================================
// ТИПЫ
// ============================================

interface MountainsSceneProps {
  quality?: "low" | "medium" | "high";
}

// ============================================
// КОМПОНЕНТЫ СЦЕНЫ
// ============================================

// ─── Ближние горы ──────────────────────────────────────────────────────────
function Mountains({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const segments = window.innerWidth < 768 ? 40 : 80;
    const geo = new THREE.PlaneGeometry(30, 20, segments, segments);
    const positions = geo.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z =
        Math.sin(x * 0.4) * 1.5 +
        Math.cos(y * 0.3) * 1.2 +
        Math.sin(x * 0.8 + y * 0.5) * 0.8 +
        Math.cos(x * 0.2 - y * 0.6) * 1.0 +
        Math.sin(x * 1.2 + y * 0.9) * 0.4;
      positions.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.03) * 0.015;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 3.5, 0, 0]} position={[0, -2, -5]}>
      <meshStandardMaterial
        color={isDark ? "#0B4F6C" : "#2E7D32"}
        wireframe={false}
        flatShading
        roughness={0.7}
        metalness={0.1}
        emissive={isDark ? new THREE.Color("#0A3040") : new THREE.Color("#1B5E20")}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

// ─── Дальние горы ───────────────────────────────────────────────────────────
function MountainsFar({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const segments = window.innerWidth < 768 ? 30 : 60;
    const geo = new THREE.PlaneGeometry(40, 15, segments, segments);
    const positions = geo.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z =
        Math.sin(x * 0.3 + 1) * 2.0 +
        Math.cos(y * 0.25 + 0.5) * 1.5 +
        Math.sin(x * 0.6 + y * 0.4) * 0.6;
      positions.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 3.5, 0, 0]} position={[0, -1, -12]}>
      <meshStandardMaterial 
        color={isDark ? "#1A3B2E" : "#4A7C59"} 
        flatShading 
        roughness={0.85} 
        metalness={0.05}
        emissive={isDark ? new THREE.Color("#0D1F18") : new THREE.Color("#2D5A3F")}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

// ─── Снежные вершины (зимний режим) ─────────────────────────────────────────
function SnowCaps({ isDark }: { isDark: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const count = 400;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 35;
      const y = (Math.random() - 0.5) * 20;
      const z = 
        Math.sin(x * 0.4) * 1.5 +
        Math.cos(y * 0.3) * 1.2 +
        Math.sin(x * 0.8 + y * 0.5) * 0.8 +
        Math.cos(x * 0.2 - y * 0.6) * 1.0 +
        Math.sin(x * 1.2 + y * 0.9) * 0.4 + 0.1;
      
      if (z > 2.5) {
        pos[i * 3] = x;
        pos[i * 3 + 1] = y - 1.5;
        pos[i * 3 + 2] = z;
        
        const brightness = 0.8 + Math.random() * 0.4;
        col[i * 3] = brightness;
        col[i * 3 + 1] = brightness * 0.95;
        col[i * 3 + 2] = 1.0;
      }
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.7 + Math.sin(clock.getElapsedTime() * 0.5) * 0.15;
    }
  });

  if (!isDark) return null; // Снег только в тёмной теме (зима)

  return (
    <points ref={pointsRef} rotation={[-Math.PI / 3.5, 0, 0]} position={[0, -2, -5]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} transparent opacity={0.8} vertexColors sizeAttenuation />
    </points>
  );
}

// ─── Парящие частицы ────────────────────────────────────────────────────────
function Particles({ isDark }: { isDark: boolean }) {
  const count = 200;
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.005;
      
      const posAttr = meshRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const y = posAttr.getY(i);
        const speed = 0.003 + (i % 3) * 0.002;
        posAttr.setY(i, y - speed);
        if (y < -12) {
          posAttr.setY(i, 12);
          posAttr.setX(i, (Math.random() - 0.5) * 30);
          posAttr.setZ(i, (Math.random() - 0.5) * 15 - 5);
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial 
        color={isDark ? "#E6B31E" : "#FFD700"} 
        size={0.05} 
        transparent 
        opacity={isDark ? 0.6 : 0.4} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Туман ──────────────────────────────────────────────────────────────────
function SceneFog({ isDark }: { isDark: boolean }) {
  const { scene } = useThree();
  
  useMemo(() => {
    scene.fog = new THREE.FogExp2(
      isDark ? "#020C18" : "#87CEEB", 
      0.025
    );
  }, [scene, isDark]);
  
  return null;
}

// ─── Камера ─────────────────────────────────────────────────────────────────
function CameraController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useMemo(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.4 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.current.y * 0.25 + 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, -2);
  });

  return null;
}

// ============================================
// СКЕЛЕТОН ЗАГРУЗКИ
// ============================================

const SceneSkeleton = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-[#E6B31E] animate-spin" />
  </div>
);

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function MountainsScene({ quality = "medium" }: MountainsSceneProps) {
  const { isDark } = useTheme();

  const dpr: [number, number] = quality === "high" ? [1, 2] : [1, 1.5];
  const antialias = quality !== "low";

  return (
    <div className="absolute inset-0 w-full h-full">
      <Suspense fallback={<SceneSkeleton />}>
        <Canvas
          camera={{ position: [0, 2, 8], fov: 60 }}
          gl={{ 
            antialias, 
            alpha: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: true,
          }}
          style={{ background: "transparent" }}
          dpr={dpr}
          performance={{ min: 0.5 }}
        >
          <SceneFog isDark={isDark} />
          
          <ambientLight intensity={isDark ? 0.25 : 0.5} color={isDark ? "#4A6A8A" : "#B8C5D6"} />
          <directionalLight position={[5, 10, 5]} intensity={isDark ? 1.0 : 1.4} color="#E6B31E" />
          <directionalLight position={[-5, 5, -5]} intensity={0.4} color={isDark ? "#0B4F6C" : "#4A9EBF"} />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#F7F9FC" />
          
          <CameraController />
          <MountainsFar isDark={isDark} />
          <Mountains isDark={isDark} />
          <SnowCaps isDark={isDark} />
          <Particles isDark={isDark} />
        </Canvas>
      </Suspense>
    </div>
  );
}