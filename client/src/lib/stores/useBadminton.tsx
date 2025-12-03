import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameScreen = "menu" | "playing" | "matchEnd";
export type GameMode = "ai" | "local";
export type AIDifficulty = "beginner" | "intermediate" | "expert";

interface Player {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  isGrounded: boolean;
  score: number;
  name: string;
  color: string;
}

interface Shuttlecock {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isInPlay: boolean;
  lastHitBy: 1 | 2 | null;
}

interface BadmintonState {
  screen: GameScreen;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  playerName: string;
  playerColor: string;
  
  player1: Player;
  player2: Player;
  shuttlecock: Shuttlecock;
  
  isServing: boolean;
  servingPlayer: 1 | 2;
  matchPoint: number;
  winner: 1 | 2 | null;
  
  setScreen: (screen: GameScreen) => void;
  setGameMode: (mode: GameMode) => void;
  setAIDifficulty: (difficulty: AIDifficulty) => void;
  setPlayerName: (name: string) => void;
  setPlayerColor: (color: string) => void;
  
  updatePlayer1: (updates: Partial<Player>) => void;
  updatePlayer2: (updates: Partial<Player>) => void;
  updateShuttlecock: (updates: Partial<Shuttlecock>) => void;
  
  scorePoint: (player: 1 | 2) => void;
  startServe: () => void;
  resetMatch: () => void;
  startNewGame: () => void;
}

const GROUND_Y = -3.5;
const MATCH_POINT = 21;

const initialPlayer1: Player = {
  x: -5,
  y: GROUND_Y + 0.75,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  isGrounded: true,
  score: 0,
  name: "Player 1",
  color: "#2563eb",
};

const initialPlayer2: Player = {
  x: 5,
  y: GROUND_Y + 0.75,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  isGrounded: true,
  score: 0,
  name: "Player 2",
  color: "#dc2626",
};

const initialShuttlecock: Shuttlecock = {
  x: -5,
  y: GROUND_Y + 1.5,
  velocityX: 0,
  velocityY: 0,
  isInPlay: false,
  lastHitBy: null,
};

export const useBadminton = create<BadmintonState>()(
  subscribeWithSelector((set, get) => ({
    screen: "menu",
    gameMode: "ai",
    aiDifficulty: "intermediate",
    playerName: "Player",
    playerColor: "#2563eb",
    
    player1: { ...initialPlayer1 },
    player2: { ...initialPlayer2 },
    shuttlecock: { ...initialShuttlecock },
    
    isServing: true,
    servingPlayer: 1,
    matchPoint: MATCH_POINT,
    winner: null,
    
    setScreen: (screen) => set({ screen }),
    setGameMode: (mode) => set({ gameMode: mode }),
    setAIDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),
    setPlayerName: (name) => set({ playerName: name }),
    setPlayerColor: (color) => set({ 
      playerColor: color,
      player1: { ...get().player1, color }
    }),
    
    updatePlayer1: (updates) => set((state) => ({
      player1: { ...state.player1, ...updates }
    })),
    
    updatePlayer2: (updates) => set((state) => ({
      player2: { ...state.player2, ...updates }
    })),
    
    updateShuttlecock: (updates) => set((state) => ({
      shuttlecock: { ...state.shuttlecock, ...updates }
    })),
    
    scorePoint: (player) => {
      const state = get();
      const newScore = player === 1 
        ? state.player1.score + 1 
        : state.player2.score + 1;
      
      if (player === 1) {
        set((s) => ({ 
          player1: { ...s.player1, score: newScore },
          servingPlayer: 1,
          isServing: true,
        }));
      } else {
        set((s) => ({ 
          player2: { ...s.player2, score: newScore },
          servingPlayer: 2,
          isServing: true,
        }));
      }
      
      const updatedState = get();
      if (updatedState.player1.score >= MATCH_POINT && 
          updatedState.player1.score - updatedState.player2.score >= 2) {
        set({ winner: 1, screen: "matchEnd" });
      } else if (updatedState.player2.score >= MATCH_POINT && 
                 updatedState.player2.score - updatedState.player1.score >= 2) {
        set({ winner: 2, screen: "matchEnd" });
      }
      
      const serverX = updatedState.servingPlayer === 1 ? -5 : 5;
      set({
        shuttlecock: {
          x: serverX,
          y: GROUND_Y + 1.5,
          velocityX: 0,
          velocityY: 0,
          isInPlay: false,
          lastHitBy: null,
        }
      });
    },
    
    startServe: () => set({ isServing: false }),
    
    resetMatch: () => {
      const state = get();
      set({
        player1: { ...initialPlayer1, name: state.playerName, color: state.playerColor },
        player2: { ...initialPlayer2 },
        shuttlecock: { ...initialShuttlecock },
        isServing: true,
        servingPlayer: 1,
        winner: null,
        screen: "menu",
      });
    },
    
    startNewGame: () => {
      const state = get();
      const aiName = `CPU (${state.aiDifficulty})`;
      
      set({
        gameMode: "ai",
        player1: { ...initialPlayer1, name: state.playerName, color: state.playerColor },
        player2: { ...initialPlayer2, name: aiName },
        shuttlecock: { ...initialShuttlecock },
        isServing: true,
        servingPlayer: 1,
        winner: null,
        screen: "playing",
      });
    },
  }))
);
