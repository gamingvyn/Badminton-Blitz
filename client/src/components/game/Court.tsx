import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useMemo } from "react";

const COURT_WIDTH = 16;
const COURT_HEIGHT = 10;
const NET_HEIGHT = 2.5;
const NET_Y = -3.5;
const GROUND_Y = -4;

export function Court() {
  const woodTexture = useTexture("/textures/wood.jpg");
  
  useMemo(() => {
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(4, 2);
  }, [woodTexture]);
  
  return (
    <group>
      <mesh position={[0, GROUND_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[COURT_WIDTH + 2, 8]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>
      
      <mesh position={[0, NET_Y + NET_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.1, NET_HEIGHT, 0.1]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      <mesh position={[0, NET_Y + NET_HEIGHT / 2 + 0.05, 0]}>
        <boxGeometry args={[0.15, NET_HEIGHT - 0.1, 0.05]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh position={[0, NET_Y + NET_HEIGHT + 0.1, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[-COURT_WIDTH / 2 - 0.1, GROUND_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[COURT_WIDTH / 2 + 0.1, GROUND_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[0, GROUND_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[-COURT_WIDTH / 4, GROUND_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.03, 8]} />
        <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>
      <mesh position={[COURT_WIDTH / 4, GROUND_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.03, 8]} />
        <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>
      
      <mesh position={[0, 4, -5]}>
        <planeGeometry args={[30, 15]} />
        <meshBasicMaterial color="#1a4a1a" />
      </mesh>
    </group>
  );
}
