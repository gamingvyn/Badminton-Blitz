import { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useBadminton } from "@/lib/stores/useBadminton";
import { useAudio } from "@/lib/stores/useAudio";

const GROUND_Y = -3.5;
const PLAYER_SPEED = 8;
const JUMP_FORCE = 12;
const GRAVITY = -25;
const COURT_LEFT = -7.5;
const COURT_RIGHT = 7.5;
const NET_X = 0;

interface PlayerProps {
  playerId: 1 | 2;
  color: string;
}

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

function StickmanModel({ 
  color, 
  velocityX, 
  isGrounded, 
  swingPhaseRef,
  facingRight 
}: { 
  color: string; 
  velocityX: number; 
  isGrounded: boolean;
  swingPhaseRef: React.MutableRefObject<number>;
  facingRight: boolean;
}) {
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const racketArmRef = useRef<THREE.Group>(null);
  const legPhaseRef = useRef(0);
  
  const racketSide = facingRight ? 1 : -1;
  
  useFrame((_, delta) => {
    if (!isGrounded) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.3;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.3;
    } else if (Math.abs(velocityX) > 0.1) {
      legPhaseRef.current += delta * 15;
      const legSwing = Math.sin(legPhaseRef.current) * 0.6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
    
    if (leftArmRef.current) {
      if (Math.abs(velocityX) > 0.1 && isGrounded) {
        const armSwing = Math.sin(legPhaseRef.current) * 0.4;
        leftArmRef.current.rotation.x = -armSwing;
      } else {
        leftArmRef.current.rotation.x = 0;
      }
    }
    
    if (racketArmRef.current) {
      const baseAngle = -0.5 * racketSide;
      const swingAngle = swingPhaseRef.current * -2.0 * racketSide;
      racketArmRef.current.rotation.z = baseAngle + swingAngle;
      racketArmRef.current.rotation.x = swingPhaseRef.current * -0.5;
    }
  });
  
  const skinColor = "#ffdbac";
  const limbThickness = 0.06;
  
  return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <group ref={leftArmRef} position={[-0.18 * racketSide, 0.7, 0]}>
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, 0.2 * racketSide]}>
          <cylinderGeometry args={[limbThickness, limbThickness, 0.25]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[-0.05 * racketSide, -0.35, 0]} rotation={[0, 0, 0.1 * racketSide]}>
          <cylinderGeometry args={[limbThickness * 0.9, limbThickness * 0.9, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      <group ref={racketArmRef} position={[0.18 * racketSide, 0.7, 0]}>
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, -0.2 * racketSide]}>
          <cylinderGeometry args={[limbThickness, limbThickness, 0.25]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0.05 * racketSide, -0.35, 0]} rotation={[0, 0, -0.1 * racketSide]}>
          <cylinderGeometry args={[limbThickness * 0.9, limbThickness * 0.9, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        
        <group position={[0.1 * racketSide, -0.5, 0]} rotation={[0, 0, -0.3 * racketSide]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <ringGeometry args={[0.08, 0.12, 12]} />
            <meshStandardMaterial color="#333333" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <circleGeometry args={[0.08, 12]} />
            <meshStandardMaterial color="#eeeeee" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
      
      <group ref={leftLegRef} position={[-0.08, 0.28, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[limbThickness, limbThickness, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[limbThickness * 0.9, limbThickness * 0.9, 0.25]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0.02, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.08, 4, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.08, 0.28, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[limbThickness, limbThickness, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[limbThickness * 0.9, limbThickness * 0.9, 0.25]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0.02, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.08, 4, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
    </group>
  );
}

export function Player({ playerId, color }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const swingPhaseRef = useRef(0);
  
  const { 
    player1, player2, shuttlecock, isServing, servingPlayer, gameMode, aiDifficulty,
    updatePlayer1, updatePlayer2, updateShuttlecock, startServe 
  } = useBadminton();
  const { playHit } = useAudio();
  
  const player = playerId === 1 ? player1 : player2;
  const updatePlayer = playerId === 1 ? updatePlayer1 : updatePlayer2;
  
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const leftKey = playerId === 1 ? Controls.left : Controls.left2;
  const rightKey = playerId === 1 ? Controls.right : Controls.right2;
  const jumpKey = playerId === 1 ? Controls.jump : Controls.jump2;
  const smashKey = playerId === 1 ? Controls.smash : Controls.smash2;
  const lobKey = playerId === 1 ? Controls.lob : Controls.lob2;
  
  const isAI = playerId === 2 && gameMode === "ai";
  const facingRight = playerId === 1;
  
  const triggerSwing = useCallback(() => {
    swingPhaseRef.current = 1;
  }, []);
  
  const hitShuttlecock = useCallback((isSmash: boolean) => {
    const shuttle = shuttlecock;
    const dx = shuttle.x - player.x;
    const dy = shuttle.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 2.0) {
      triggerSwing();
      
      const isJumping = !player.isGrounded;
      const direction = playerId === 1 ? 1 : -1;
      
      let power = isSmash ? 15 : 10;
      let angle = isSmash ? 0.3 : 0.8;
      
      if (isSmash && isJumping) {
        power = 22;
        angle = -0.2;
      }
      
      const velocityX = direction * power * Math.cos(angle);
      const velocityY = power * Math.sin(angle) + (isSmash && isJumping ? 2 : 5);
      
      updateShuttlecock({
        velocityX,
        velocityY,
        lastHitBy: playerId,
        isInPlay: true,
      });
      
      playHit();
      
      if (isServing && servingPlayer === playerId) {
        startServe();
      }
    }
  }, [shuttlecock, player, playerId, updateShuttlecock, playHit, isServing, servingPlayer, startServe, triggerSwing]);
  
  const prevSmash = useRef(false);
  const prevLob = useRef(false);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    if (swingPhaseRef.current > 0) {
      swingPhaseRef.current = Math.max(0, swingPhaseRef.current - delta * 5);
    }
    
    const keys = getKeys();
    let velocityX = player.velocityX;
    let velocityY = player.velocityY;
    let isGrounded = player.isGrounded;
    let x = player.x;
    let y = player.y;
    
    if (isAI) {
      const shuttle = shuttlecock;
      
      const difficultySettings = {
        beginner: { speed: 0.4, reactionDelay: 0.4, smashChance: 0.2, jumpChance: 0.1 },
        intermediate: { speed: 0.7, reactionDelay: 0.25, smashChance: 0.5, jumpChance: 0.4 },
        expert: { speed: 1.0, reactionDelay: 0.1, smashChance: 0.8, jumpChance: 0.7 },
      };
      
      const settings = difficultySettings[aiDifficulty];
      const aiSpeed = PLAYER_SPEED * settings.speed;
      
      if (isServing && servingPlayer === 2) {
        if (Math.abs(x - 5) < 0.3) {
          hitShuttlecock(false);
        } else {
          if (x < 5) {
            velocityX = aiSpeed;
          } else {
            velocityX = -aiSpeed;
          }
        }
      } else {
        const predictionFactor = settings.reactionDelay;
        const targetX = shuttle.isInPlay && shuttle.lastHitBy === 1 
          ? shuttle.x + shuttle.velocityX * predictionFactor
          : 5;
        
        const clampedTarget = Math.max(0.5, Math.min(COURT_RIGHT - 0.5, targetX));
        
        if (x < clampedTarget - 0.3) {
          velocityX = aiSpeed;
        } else if (x > clampedTarget + 0.3) {
          velocityX = -aiSpeed;
        } else {
          velocityX = 0;
        }
        
        const shouldJump = shuttle.isInPlay && 
          shuttle.y > -1 && 
          Math.abs(shuttle.x - x) < 2.5 &&
          shuttle.velocityX < 0 &&
          isGrounded &&
          Math.random() < settings.jumpChance;
          
        if (shouldJump) {
          velocityY = JUMP_FORCE;
          isGrounded = false;
        }
        
        const shouldHit = shuttle.isInPlay &&
          shuttle.lastHitBy === 1 &&
          Math.abs(shuttle.x - x) < 2.5 &&
          Math.abs(shuttle.y - y) < 2.5;
          
        if (shouldHit) {
          const isJumpSmash = !isGrounded && shuttle.y > 0;
          hitShuttlecock(isJumpSmash || Math.random() < settings.smashChance);
        }
      }
    } else {
      const moveLeft = keys[leftKey];
      const moveRight = keys[rightKey];
      const jump = keys[jumpKey];
      const smash = keys[smashKey];
      const lob = keys[lobKey];
      
      if (moveLeft) {
        velocityX = -PLAYER_SPEED;
      } else if (moveRight) {
        velocityX = PLAYER_SPEED;
      } else {
        velocityX = 0;
      }
      
      if (jump && isGrounded) {
        velocityY = JUMP_FORCE;
        isGrounded = false;
      }
      
      if (smash && !prevSmash.current) {
        hitShuttlecock(true);
      }
      if (lob && !prevLob.current) {
        hitShuttlecock(false);
      }
      
      prevSmash.current = smash;
      prevLob.current = lob;
    }
    
    if (!isGrounded) {
      velocityY += GRAVITY * delta;
    }
    
    x += velocityX * delta;
    y += velocityY * delta;
    
    if (y <= GROUND_Y + 0.75) {
      y = GROUND_Y + 0.75;
      velocityY = 0;
      isGrounded = true;
    }
    
    const minX = playerId === 1 ? COURT_LEFT + 0.5 : NET_X + 0.5;
    const maxX = playerId === 1 ? NET_X - 0.5 : COURT_RIGHT - 0.5;
    x = Math.max(minX, Math.min(maxX, x));
    
    updatePlayer({
      x,
      y,
      velocityX,
      velocityY,
      isGrounded,
      isJumping: !isGrounded,
    });
    
    groupRef.current.position.set(x, y, 0);
  });
  
  return (
    <group ref={groupRef} position={[player.x, player.y, 0]}>
      <StickmanModel 
        color={color} 
        velocityX={player.velocityX}
        isGrounded={player.isGrounded}
        swingPhaseRef={swingPhaseRef}
        facingRight={facingRight}
      />
    </group>
  );
}
