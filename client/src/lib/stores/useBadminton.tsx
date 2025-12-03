import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameScreen = "login" | "register" | "menu" | "playing" | "matchEnd" | "stats";
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

interface UserData {
  id: number;
  username: string;
  wins: number;
  losses: number;
  avatarColor: string;
}

interface MatchData {
  id: number;
  player1Score: number;
  player2Score: number;
  winnerId: number;
  gameMode: string;
  aiDifficulty: string | null;
  playedAt: string;
}

interface BadmintonState {
  screen: GameScreen;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  currentUser: UserData | null;
  matchHistory: MatchData[];
  
  player1: Player;
  player2: Player;
  shuttlecock: Shuttlecock;
  
  isServing: boolean;
  servingPlayer: 1 | 2;
  matchPoint: number;
  winner: 1 | 2 | null;
  
  isLoading: boolean;
  error: string | null;
  
  setScreen: (screen: GameScreen) => void;
  setGameMode: (mode: GameMode) => void;
  setAIDifficulty: (difficulty: AIDifficulty) => void;
  setError: (error: string | null) => void;
  
  updatePlayer1: (updates: Partial<Player>) => void;
  updatePlayer2: (updates: Partial<Player>) => void;
  updateShuttlecock: (updates: Partial<Shuttlecock>) => void;
  
  scorePoint: (player: 1 | 2) => void;
  startServe: () => void;
  resetMatch: () => void;
  startNewGame: (mode: GameMode, player1Name: string, player2Name: string) => void;
  
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAvatarColor: (color: string) => Promise<void>;
  recordMatch: () => Promise<void>;
  loadMatchHistory: () => Promise<void>;
  refreshUserData: () => Promise<void>;
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
    screen: "login",
    gameMode: "ai",
    aiDifficulty: "intermediate",
    currentUser: null,
    matchHistory: [],
    
    player1: { ...initialPlayer1 },
    player2: { ...initialPlayer2 },
    shuttlecock: { ...initialShuttlecock },
    
    isServing: true,
    servingPlayer: 1,
    matchPoint: MATCH_POINT,
    winner: null,
    
    isLoading: false,
    error: null,
    
    setScreen: (screen) => set({ screen }),
    setGameMode: (mode) => set({ gameMode: mode }),
    setAIDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),
    setError: (error) => set({ error }),
    
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
        get().recordMatch();
      } else if (updatedState.player2.score >= MATCH_POINT && 
                 updatedState.player2.score - updatedState.player1.score >= 2) {
        set({ winner: 2, screen: "matchEnd" });
        get().recordMatch();
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
    
    resetMatch: () => set({
      player1: { ...initialPlayer1 },
      player2: { ...initialPlayer2 },
      shuttlecock: { ...initialShuttlecock },
      isServing: true,
      servingPlayer: 1,
      winner: null,
      screen: "menu",
    }),
    
    startNewGame: (mode, player1Name, player2Name) => {
      const state = get();
      const p1Color = state.currentUser?.avatarColor || "#2563eb";
      
      set({
        gameMode: mode,
        player1: { ...initialPlayer1, name: player1Name, color: p1Color },
        player2: { ...initialPlayer2, name: player2Name },
        shuttlecock: { ...initialShuttlecock },
        isServing: true,
        servingPlayer: 1,
        winner: null,
        screen: "playing",
      });
    },
    
    login: async (username, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          set({ error: data.message || "Login failed", isLoading: false });
          return false;
        }
        
        const user = await response.json();
        set({ 
          currentUser: user, 
          screen: "menu", 
          isLoading: false,
          player1: { ...initialPlayer1, color: user.avatarColor }
        });
        return true;
      } catch (error) {
        set({ error: "Connection error", isLoading: false });
        return false;
      }
    },
    
    register: async (username, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          set({ error: data.message || "Registration failed", isLoading: false });
          return false;
        }
        
        const user = await response.json();
        set({ currentUser: user, screen: "menu", isLoading: false });
        return true;
      } catch (error) {
        set({ error: "Connection error", isLoading: false });
        return false;
      }
    },
    
    logout: () => set({ 
      currentUser: null, 
      screen: "login",
      matchHistory: [],
    }),
    
    updateAvatarColor: async (color) => {
      const state = get();
      if (!state.currentUser) return;
      
      try {
        await fetch(`/api/users/${state.currentUser.id}/avatar`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarColor: color }),
        });
        
        set({
          currentUser: { ...state.currentUser, avatarColor: color },
          player1: { ...state.player1, color },
        });
      } catch (error) {
        console.error("Failed to update avatar:", error);
      }
    },
    
    recordMatch: async () => {
      const state = get();
      if (!state.currentUser) return;
      
      try {
        await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            player1Id: state.currentUser.id,
            player2Id: state.gameMode === "local" ? null : null,
            player1Score: state.player1.score,
            player2Score: state.player2.score,
            winnerId: state.winner === 1 ? state.currentUser.id : 0,
            gameMode: state.gameMode,
            aiDifficulty: state.gameMode === "ai" ? state.aiDifficulty : null,
          }),
        });
        
        await get().refreshUserData();
      } catch (error) {
        console.error("Failed to record match:", error);
      }
    },
    
    loadMatchHistory: async () => {
      const state = get();
      if (!state.currentUser) return;
      
      try {
        const response = await fetch(`/api/matches/${state.currentUser.id}`);
        if (response.ok) {
          const matches = await response.json();
          set({ matchHistory: matches });
        }
      } catch (error) {
        console.error("Failed to load match history:", error);
      }
    },
    
    refreshUserData: async () => {
      const state = get();
      if (!state.currentUser) return;
      
      try {
        const response = await fetch(`/api/users/${state.currentUser.id}`);
        if (response.ok) {
          const user = await response.json();
          set({ currentUser: user });
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    },
  }))
);
