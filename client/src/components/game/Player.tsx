import { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useBadminton } from "@/lib/stores/useBadminton";
import { useAudio } from "@/lib/stores/useAudio";

const GROUND_Y = -3.5;
const PLAYER_SPEED = 8;
const JUMP_FORCE = 14;
const GRAVITY = -28;
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
  velocityY,
  isGrounded, 
  swingPhaseRef,
  isSmashingRef,
  facingRight 
}: { 
  color: string; 
  velocityX: number;
  velocityY: number;
  isGrounded: boolean;
  swingPhaseRef: React.MutableRefObject<number>;
  isSmashingRef: React.MutableRefObject<boolean>;
  facingRight: boolean;
}) {
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const racketArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const legPhaseRef = useRef(0);
  
  const racketSide = facingRight ? 1 : -1;
  
  useFrame((_, delta) => {
    const swingPhase = swingPhaseRef.current;
    const isSmashing = isSmashingRef.current;
    
    if (!isGrounded) {
      const jumpIntensity = Math.min(1, Math.abs(velocityY) / 10);
      
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -0.5 - jumpIntensity * 0.3;
        leftLegRef.current.rotation.z = -0.15;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = 0.4 + jumpIntensity * 0.2;
        rightLegRef.current.rotation.z = 0.15;
      }
      
      if (bodyRef.current) {
        bodyRef.current.rotation.x = -0.15 - swingPhase * 0.3;
        bodyRef.current.rotation.z = swingPhase * 0.2 * racketSide;
      }
      
      if (headRef.current) {
        headRef.current.rotation.x = 0.2;
      }
    } else if (Math.abs(velocityX) > 0.1) {
      legPhaseRef.current += delta * 18;
      const legSwing = Math.sin(legPhaseRef.current) * 0.7;
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = legSwing;
        leftLegRef.current.rotation.z = 0;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -legSwing;
        rightLegRef.current.rotation.z = 0;
      }
      
      if (bodyRef.current) {
        bodyRef.current.rotation.x = -0.1;
        bodyRef.current.rotation.z = Math.sin(legPhaseRef.current * 0.5) * 0.05;
      }
      
      if (headRef.current) {
        headRef.current.rotation.x = 0;
      }
    } else {
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = 0;
        leftLegRef.current.rotation.z = 0;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.z = 0;
      }
      if (bodyRef.current) {
        bodyRef.current.rotation.x = swingPhase * -0.2;
        bodyRef.current.rotation.z = swingPhase * 0.1 * racketSide;
      }
      if (headRef.current) {
        headRef.current.rotation.x = 0;
      }
    }
    
    if (leftArmRef.current) {
      if (!isGrounded && swingPhase > 0) {
        leftArmRef.current.rotation.z = 0.8 * racketSide;
        leftArmRef.current.rotation.x = -0.5;
      } else if (Math.abs(velocityX) > 0.1 && isGrounded) {
        const armSwing = Math.sin(legPhaseRef.current) * 0.5;
        leftArmRef.current.rotation.x = -armSwing;
        leftArmRef.current.rotation.z = 0.2 * racketSide;
      } else {
        leftArmRef.current.rotation.x = 0;
        leftArmRef.current.rotation.z = 0.2 * racketSide;
      }
    }
    
    if (racketArmRef.current) {
      if (!isGrounded && swingPhase > 0) {
        const powerSwing = swingPhase * (isSmashing ? 3.5 : 2.5);
        racketArmRef.current.rotation.z = (-1.2 - powerSwing) * racketSide;
        racketArmRef.current.rotation.x = -0.8 - swingPhase * 0.5;
      } else if (swingPhase > 0) {
        const groundSwing = swingPhase * 2.0;
        racketArmRef.current.rotation.z = (-0.5 - groundSwing) * racketSide;
        racketArmRef.current.rotation.x = -0.3 - swingPhase * 0.4;
      } else {
        racketArmRef.current.rotation.z = -0.5 * racketSide;
        racketArmRef.current.rotation.x = 0;
      }
    }
  });
  
  const skinColor = "#ffdbac";
  const limbThickness = 0.07;
  
  return (
    <group ref={bodyRef}>
      <mesh ref={headRef} position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.08 * racketSide, 0.08, 0.02]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.12, 0.55]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <group ref={leftArmRef} position={[-0.2 * racketSide, 0.75, 0]}>
        <mesh position={[0, -0.12, 0]} rotation={[0, 0, 0.3 * racketSide]}>
          <cylinderGeometry args={[limbThickness, limbThickness, 0.22]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[-0.08 * racketSide, -0.28, 0]}>
          <cylinderGeometry args={[limbThickness * 0.85, limbThickness * 0.85, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[-0.08 * racketSide, -0.4, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      <group ref={racketArmRef} position={[0.2 * racketSide, 0.75, 0]}>
        <mesh position={[0, -0.12, 0]} rotation={[0, 0, -0.3 * racketSide]}>
          <cylinderGeometry args={[limbThickness, limbThickness, 0.22]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0.08 * racketSide, -0.28, 0]}>
          <cylinderGeometry args={[limbThickness * 0.85, limbThickness * 0.85, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        
        <group position={[0.12 * racketSide, -0.42, 0]} rotation={[0, 0, -0.4 * racketSide]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.35]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 0.4, 0]} rotation={[0.1, 0, 0]}>
            <ringGeometry args={[0.1, 0.15, 16]} />
            <meshStandardMaterial color="#222222" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.4, 0]} rotation={[0.1, 0, 0]}>
            <circleGeometry args={[0.1, 16]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
      
      <group ref={leftLegRef} position={[-0.09, 0.26, 0]}>
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[limbThickness, limbThickness, 0.28]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[limbThickness * 0.9, limbThickness * 0.85, 0.26]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0.03, -0.54, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.05, 0.1, 4, 8]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.09, 0.26, 0]}>
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[limbThickness, limbThickness, 0.28]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[limbThickness * 0.9, limbThickness * 0.85, 0.26]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0.03, -0.54, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.05, 0.1, 4, 8]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      </group>
    </group>
  );
}

export function Player({ playerId, color }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const swingPhaseRef = useRef(0);
  const isSmashingRef = useRef(false);
  
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
  
  const triggerSwing = useCallback((isSmash: boolean) => {
    swingPhaseRef.current = 1;
    isSmashingRef.current = isSmash;
  }, []);
  
  const hitShuttlecock = useCallback((isSmash: boolean) => {
    const shuttle = shuttlecock;
    const dx = shuttle.x - player.x;
    const dy = shuttle.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 2.2) {
      triggerSwing(isSmash);
      
      const isJumping = !player.isGrounded;
      const direction = playerId === 1 ? 1 : -1;
      
      let power: number;
      let angle: number;
      let yBoost: number;
      
      if (isSmash) {
        if (isJumping) {
          power = 25;
          angle = -0.25;
          yBoost = 3;
        } else {
          power = 16;
          angle = 0.25;
          yBoost = 4;
        }
      } else {
        power = 14;
        angle = 0.9;
        yBoost = 8;
      }
      
      const velocityX = direction * power * Math.cos(angle);
      const velocityY = power * Math.sin(angle) + yBoost;
      
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
  const aiHitCooldown = useRef(0);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    if (swingPhaseRef.current > 0) {
      swingPhaseRef.current = Math.max(0, swingPhaseRef.current - delta * 4);
    }
    
    if (aiHitCooldown.current > 0) {
      aiHitCooldown.current -= delta;
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
        beginner: { 
          speed: 0.5, 
          predictionTime: 0.3, 
          smashChance: 0.25, 
          jumpSmashChance: 0.15,
          reactionRadius: 2.0,
          positioningError: 0.8
        },
        intermediate: { 
          speed: 0.8, 
          predictionTime: 0.5, 
          smashChance: 0.55, 
          jumpSmashChance: 0.4,
          reactionRadius: 2.5,
          positioningError: 0.4
        },
        expert: { 
          speed: 1.1, 
          predictionTime: 0.8, 
          smashChance: 0.85, 
          jumpSmashChance: 0.7,
          reactionRadius: 3.0,
          positioningError: 0.15
        },
      };
      
      const settings = difficultySettings[aiDifficulty];
      const aiSpeed = PLAYER_SPEED * settings.speed;
      
      if (isServing && servingPlayer === 2) {
        const servePos = 5;
        if (Math.abs(x - servePos) < 0.2) {
          if (aiHitCooldown.current <= 0) {
            hitShuttlecock(false);
            aiHitCooldown.current = 0.5;
          }
        } else {
          velocityX = x < servePos ? aiSpeed : -aiSpeed;
        }
      } else {
        let targetX = 5;
        
        if (shuttle.isInPlay && shuttle.lastHitBy === 1) {
          const timeToReach = shuttle.velocityX !== 0 
            ? Math.abs((x - shuttle.x) / shuttle.velocityX)
            : 1;
          
          const predictedX = shuttle.x + shuttle.velocityX * Math.min(timeToReach, settings.predictionTime);
          const predictedY = shuttle.y + shuttle.velocityY * Math.min(timeToReach, settings.predictionTime) 
            + 0.5 * GRAVITY * Math.pow(Math.min(timeToReach, settings.predictionTime), 2);
          
          if (predictedX > 0) {
            targetX = predictedX + (Math.random() - 0.5) * settings.positioningError;
          }
          
          const distanceToShuttle = Math.sqrt(
            Math.pow(shuttle.x - x, 2) + Math.pow(shuttle.y - y, 2)
          );
          
          const shouldJumpSmash = 
            shuttle.y > 0 &&
            shuttle.y < 3 &&
            distanceToShuttle < settings.reactionRadius &&
            shuttle.velocityY < 0 &&
            isGrounded &&
            Math.random() < settings.jumpSmashChance;
          
          if (shouldJumpSmash) {
            velocityY = JUMP_FORCE;
            isGrounded = false;
          }
          
          const inHitRange = distanceToShuttle < settings.reactionRadius;
          
          if (inHitRange && aiHitCooldown.current <= 0) {
            const shouldSmash = !isGrounded || 
              (shuttle.y > -1 && Math.random() < settings.smashChance);
            hitShuttlecock(shouldSmash);
            aiHitCooldown.current = 0.3;
          }
        }
        
        targetX = Math.max(0.8, Math.min(COURT_RIGHT - 0.8, targetX));
        
        const moveThreshold = 0.25;
        if (x < targetX - moveThreshold) {
          velocityX = aiSpeed;
        } else if (x > targetX + moveThreshold) {
          velocityX = -aiSpeed;
        } else {
          velocityX = 0;
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
        velocityY={player.velocityY}
        isGrounded={player.isGrounded}
        swingPhaseRef={swingPhaseRef}
        isSmashingRef={isSmashingRef}
        facingRight={facingRight}
      />
    </group>
  );
}
