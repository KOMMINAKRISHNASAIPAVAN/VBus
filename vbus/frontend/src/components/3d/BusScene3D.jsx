import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, MeshDistortMaterial } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function BusBody() {
  const groupRef = useRef()
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main bus body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[4, 1.4, 1.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Brand stripe */}
      <mesh position={[0, 0.2, 0.81]}>
        <planeGeometry args={[3.8, 0.25]} />
        <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={0.5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[2.01, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 0.8]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Windows row */}
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <mesh key={x} position={[x, 0.25, 0.81]}>
          <planeGeometry args={[0.55, 0.45]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.55} metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[4, 0.12, 1.6]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Wheels */}
      {[[-1.4, -0.75, 0.9], [1.4, -0.75, 0.9], [-1.4, -0.75, -0.9], [1.4, -0.75, -0.9]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.8} />
        </mesh>
      ))}
      {/* Headlights */}
      {[[2.02, 0.05, 0.5], [2.02, 0.05, -0.5]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2} />
        </mesh>
      ))}
      {/* Exhaust */}
      <mesh position={[-2.05, -0.4, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>
    </group>
  )
}

function Road() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Road markings */}
      {[-3, -1, 1, 3].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, -1.09, 0]}>
          <planeGeometry args={[1.2, 0.08]} />
          <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </>
  )
}

function FloatingOrbs() {
  return (
    <>
      {[
        [3, 1.5, -2, 0.3, '#3b82f6'],
        [-3, 0.5, 1, 0.2, '#60a5fa'],
        [1, 2.5, -3, 0.15, '#2563eb'],
        [-2, -0.5, -1, 0.25, '#93c5fd'],
      ].map(([x, y, z, size, color], i) => (
        <Float key={i} speed={1 + i * 0.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[x, y, z]}>
            <sphereGeometry args={[size, 16, 16]} />
            <MeshDistortMaterial color={color} emissive={color} emissiveIntensity={0.5}
              distort={0.4} speed={2} transparent opacity={0.6} />
          </mesh>
        </Float>
      ))}
    </>
  )
}

export default function BusScene3D({ height = 400 }) {
  return (
    <div style={{ height }} className="w-full">
      <Canvas
        shadows
        camera={{ position: [6, 3, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow color="#ffffff" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[0, 0, 3]} intensity={1} color="#60a5fa" />

        <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.3}>
          <BusBody />
        </Float>
        <Road />
        <FloatingOrbs />

        <fog attach="fog" args={['#eff6ff', 8, 22]} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  )
}
