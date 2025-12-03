import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import { Court } from "./Court";
import { Player } from "./Player";
import { Shuttlecock } from "./Shuttlecock";
import { GameHUD } from "./GameHUD";
import { useBadminton } from "@/lib/stores/useBadminton";
import { useAudio } from "@/lib/stores/useAudio";

enum Controls {
  left = "left",
  right = "right",
  jump = "jump",
  smash = "smash",
  lob = "lob",
  left2 = "left2",
  right2 = "right2",
  jump2 = "jump2",
  smash2 = "smash2",
  lob2 = "lob2",
}

const keyMap = [
  { name: Controls.left, keys: ["ArrowLeft"] },
  { name: Controls.right, keys: ["ArrowRight"] },
  { name: Controls.jump, keys: ["ArrowUp"] },
  { name: Controls.smash, keys: ["KeyZ"] },
  { name: Controls.lob, keys: ["KeyX"] },
  { name: Controls.left2, keys: ["KeyA"] },
  { name: Controls.right2, keys: ["KeyD"] },
  { name: Controls.jump2, keys: ["KeyW"] },
  { name: Controls.smash2, keys: ["KeyC"] },
  { name: Controls.lob2, keys: ["KeyV"] },
];

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} />
    </>
  );
}

function GameScene() {
  return (
    <>
      <Lights />
      <Court />
      <Player playerId={1} color="#2563eb" />
      <Player playerId={2} color="#dc2626" />
      <Shuttlecock />
    </>
  );
}

export function BadmintonGame() {
  const { screen } = useBadminton();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);
    
    const hitSfx = new Audio("/sounds/hit.mp3");
    hitSfx.volume = 0.5;
    setHitSound(hitSfx);
    
    const successSfx = new Audio("/sounds/success.mp3");
    successSfx.volume = 0.4;
    setSuccessSound(successSfx);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);
  
  if (screen !== "playing") return null;
  
  return (
    <KeyboardControls map={keyMap}>
      <div className="absolute inset-0">
        <Canvas
          shadows
          camera={{
            position: [0, 2, 12],
            fov: 50,
            near: 0.1,
            far: 100,
          }}
          gl={{
            antialias: true,
            powerPreference: "default",
          }}
        >
          <color attach="background" args={["#0a2a0a"]} />
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
        </Canvas>
        <GameHUD />
      </div>
    </KeyboardControls>
  );
}
