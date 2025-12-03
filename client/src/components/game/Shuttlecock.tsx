import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBadminton } from "@/lib/stores/useBadminton";
import { useAudio } from "@/lib/stores/useAudio";

const GRAVITY = -15;
const AIR_RESISTANCE = 0.98;
const GROUND_Y = -3.5;
const COURT_LEFT = -8;
const COURT_RIGHT = 8;
const NET_X = 0;
const NET_TOP = -1;

export function Shuttlecock() {
  const meshRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);
  
  const { 
    shuttlecock, servingPlayer, isServing,
    updateShuttlecock, scorePoint 
  } = useBadminton();
  const { playSuccess } = useAudio();
  
  const GROUND_Y = -3.5;
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    let { x, y, velocityX, velocityY, isInPlay, lastHitBy } = shuttlecock;
    
    if (isServing) {
      x = servingPlayer === 1 ? -5 : 5;
      y = GROUND_Y + 1.5;
      velocityX = 0;
      velocityY = 0;
      meshRef.current.position.set(x, y, 0);
      meshRef.current.rotation.z = 0;
      return;
    }
    
    if (!isInPlay && !isServing) {
      meshRef.current.position.set(x, y, 0);
      return;
    }
    
    velocityY += GRAVITY * delta;
    velocityX *= AIR_RESISTANCE;
    velocityY *= AIR_RESISTANCE;
    
    x += velocityX * delta;
    y += velocityY * delta;
    
    const crossingNet = (shuttlecock.x < NET_X && x >= NET_X) || 
                        (shuttlecock.x > NET_X && x <= NET_X);
    
    if (crossingNet && y < NET_TOP) {
      playSuccess();
      if (lastHitBy === 1) {
        scorePoint(2);
      } else {
        scorePoint(1);
      }
      return;
    }
    
    if (y <= GROUND_Y) {
      playSuccess();
      if (x < NET_X) {
        scorePoint(2);
      } else {
        scorePoint(1);
      }
      return;
    }
    
    if (x < COURT_LEFT || x > COURT_RIGHT) {
      playSuccess();
      if (lastHitBy === 1) {
        scorePoint(2);
      } else {
        scorePoint(1);
      }
      return;
    }
    
    updateShuttlecock({ x, y, velocityX, velocityY });
    
    meshRef.current.position.set(x, y, 0);
    
    const angle = Math.atan2(velocityY, velocityX);
    meshRef.current.rotation.z = angle - Math.PI / 2;
  });
  
  return (
    <group ref={meshRef} position={[shuttlecock.x, shuttlecock.y, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[0, 0.25, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 0.12,
            0.35,
            Math.sin((i / 6) * Math.PI * 2) * 0.12
          ]}
          rotation={[0.3, 0, (i / 6) * Math.PI * 2]}
        >
          <planeGeometry args={[0.05, 0.15]} />
          <meshStandardMaterial 
            color="#eeeeee" 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
