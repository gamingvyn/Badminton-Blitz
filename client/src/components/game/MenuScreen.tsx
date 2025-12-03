import { useState, useEffect } from "react";
import { useBadminton, type AIDifficulty } from "@/lib/stores/useBadminton";
import { useAudio } from "@/lib/stores/useAudio";

const AVATAR_COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#ca8a04", "#9333ea",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#84cc16"
];

export function MenuScreen() {
  const { 
    currentUser, startNewGame, logout, setScreen,
    aiDifficulty, setAIDifficulty, updateAvatarColor, loadMatchHistory
  } = useBadminton();
  const { isMuted, toggleMute } = useAudio();
  
  const [showLocalSetup, setShowLocalSetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [player2Name, setPlayer2Name] = useState("");
  
  useEffect(() => {
    loadMatchHistory();
  }, [loadMatchHistory]);
  
  const handlePlayAI = () => {
    startNewGame("ai", currentUser?.username || "Player 1", `CPU (${aiDifficulty})`);
  };
  
  const handlePlayLocal = () => {
    if (player2Name.trim()) {
      startNewGame("local", currentUser?.username || "Player 1", player2Name);
      setShowLocalSetup(false);
      setPlayer2Name("");
    }
  };
  
  const difficultyColors: Record<AIDifficulty, string> = {
    beginner: "bg-green-500",
    intermediate: "bg-yellow-500",
    expert: "bg-red-500",
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-green-800 to-green-950">
      <div className="bg-white/95 rounded-2xl p-8 shadow-2xl w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: currentUser?.avatarColor || "#2563eb" }}
          >
            {currentUser?.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-1">Badminton</h1>
          <p className="text-gray-600">{currentUser?.username}</p>
          <div className="flex justify-center gap-4 mt-2 text-sm">
            <span className="text-green-600 font-medium">{currentUser?.wins || 0} Wins</span>
            <span className="text-red-600 font-medium">{currentUser?.losses || 0} Losses</span>
          </div>
        </div>
        
        {!showLocalSetup && !showSettings ? (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Difficulty
              </label>
              <div className="flex gap-2">
                {(["beginner", "intermediate", "expert"] as AIDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setAIDifficulty(diff)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium capitalize transition ${
                      aiDifficulty === diff
                        ? `${difficultyColors[diff]} text-white`
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handlePlayAI}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🤖</span>
              Play vs AI
            </button>
            
            <button
              onClick={() => setShowLocalSetup(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <span className="text-2xl">👥</span>
              Play vs Friend
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setScreen("stats")}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <span>📊</span>
                Stats
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <span>⚙️</span>
                Settings
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={logout}
                className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : showSettings ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Choose Your Color</h3>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => updateAvatarColor(color)}
                  className={`w-12 h-12 rounded-full transition transform hover:scale-110 ${
                    currentUser?.avatarColor === color ? "ring-4 ring-gray-400" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Sound</h3>
              <button
                onClick={toggleMute}
                className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                  isMuted 
                    ? "bg-gray-200 text-gray-700" 
                    : "bg-green-500 text-white"
                }`}
              >
                {isMuted ? "🔇 Sound Off" : "🔊 Sound On"}
              </button>
            </div>
            
            <button
              onClick={() => setShowSettings(false)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition mt-4"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player 2 Name
              </label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="Enter Player 2's name"
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLocalSetup(false);
                  setPlayer2Name("");
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition"
              >
                Back
              </button>
              <button
                onClick={handlePlayLocal}
                disabled={!player2Name.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                Start Game
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Controls</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Player 1:</span> Arrow keys to move, Z = Smash, X = Lob</p>
            <p><span className="font-medium">Player 2:</span> WASD to move, C = Smash, V = Lob</p>
            <p className="text-xs text-gray-500 mt-2">Jump while smashing for extra power!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
