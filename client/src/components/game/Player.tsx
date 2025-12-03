import { useRef, useEffect, useCallback } from "react";
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

export function Player({ playerId, color }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const racketRef = useRef<THREE.Group>(null);
  
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
  
  const hitShuttlecock = useCallback((isSmash: boolean) => {
    const shuttle = shuttlecock;
    const dx = shuttle.x - player.x;
    const dy = shuttle.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 2.0) {
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
  }, [shuttlecock, player, playerId, updateShuttlecock, playHit, isServing, servingPlayer, startServe]);
  
  const prevSmash = useRef(false);
  const prevLob = useRef(false);
  
  useFrame((_, delta) => {
    if (!meshRef.current || !racketRef.current) return;
    
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
    
    meshRef.current.position.set(x, y, 0);
    racketRef.current.position.set(x + (playerId === 1 ? 0.5 : -0.5), y + 0.3, 0);
    racketRef.current.rotation.z = playerId === 1 ? -0.3 : 0.3;
  });
  
  return (
    <group>
      <mesh ref={meshRef} position={[player.x, player.y, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <group ref={racketRef}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <ringGeometry args={[0.15, 0.25, 16]} />
          <meshStandardMaterial color="#333333" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <circleGeometry args={[0.15, 16]} />
          <meshStandardMaterial color="#dddddd" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
