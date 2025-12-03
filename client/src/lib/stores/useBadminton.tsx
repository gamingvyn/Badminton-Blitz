import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameScreen = "login" | "register" | "menu" | "playing" | "matchEnd";
export type GameMode = "ai" | "local";

interface Player {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  isGrounded: boolean;
  score: number;
  name: string;
}

interface Shuttlecock {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isInPlay: boolean;
  lastHitBy: 1 | 2 | null;
}

interface UserAccount {
  username: string;
  password: string;
}

interface BadmintonState {
  screen: GameScreen;
  gameMode: GameMode;
  currentUser: string | null;
  
  player1: Player;
  player2: Player;
  shuttlecock: Shuttlecock;
  
  isServing: boolean;
  servingPlayer: 1 | 2;
  matchPoint: number;
  winner: 1 | 2 | null;
  
  setScreen: (screen: GameScreen) => void;
  setGameMode: (mode: GameMode) => void;
  setCurrentUser: (username: string | null) => void;
  
  updatePlayer1: (updates: Partial<Player>) => void;
  updatePlayer2: (updates: Partial<Player>) => void;
  updateShuttlecock: (updates: Partial<Shuttlecock>) => void;
  
  scorePoint: (player: 1 | 2) => void;
  startServe: () => void;
  resetMatch: () => void;
  startNewGame: (mode: GameMode, player1Name: string, player2Name: string) => void;
  
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
}

const COURT_WIDTH = 16;
const COURT_HEIGHT = 10;
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
    currentUser: null,
    
    player1: { ...initialPlayer1 },
    player2: { ...initialPlayer2 },
    shuttlecock: { ...initialShuttlecock },
    
    isServing: true,
    servingPlayer: 1,
    matchPoint: MATCH_POINT,
    winner: null,
    
    setScreen: (screen) => set({ screen }),
    setGameMode: (mode) => set({ gameMode: mode }),
    setCurrentUser: (username) => set({ currentUser: username }),
    
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
    
    resetMatch: () => set({
      player1: { ...initialPlayer1 },
      player2: { ...initialPlayer2 },
      shuttlecock: { ...initialShuttlecock },
      isServing: true,
      servingPlayer: 1,
      winner: null,
      screen: "menu",
    }),
    
    startNewGame: (mode, player1Name, player2Name) => set({
      gameMode: mode,
      player1: { ...initialPlayer1, name: player1Name },
      player2: { ...initialPlayer2, name: player2Name },
      shuttlecock: { ...initialShuttlecock },
      isServing: true,
      servingPlayer: 1,
      winner: null,
      screen: "playing",
    }),
    
    login: (username, password) => {
      const accountsJson = localStorage.getItem("badminton_accounts");
      const accounts: UserAccount[] = accountsJson ? JSON.parse(accountsJson) : [];
      
      const account = accounts.find(
        (acc) => acc.username === username && acc.password === password
      );
      
      if (account) {
        set({ currentUser: username, screen: "menu" });
        return true;
      }
      return false;
    },
    
    register: (username, password) => {
      const accountsJson = localStorage.getItem("badminton_accounts");
      const accounts: UserAccount[] = accountsJson ? JSON.parse(accountsJson) : [];
      
      if (accounts.some((acc) => acc.username === username)) {
        return false;
      }
      
      accounts.push({ username, password });
      localStorage.setItem("badminton_accounts", JSON.stringify(accounts));
      set({ currentUser: username, screen: "menu" });
      return true;
    },
    
    logout: () => set({ currentUser: null, screen: "login" }),
  }))
);
