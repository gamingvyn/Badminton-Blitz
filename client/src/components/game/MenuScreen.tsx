import { useState } from "react";
import { useBadminton } from "@/lib/stores/useBadminton";

export function MenuScreen() {
  const { currentUser, startNewGame, logout } = useBadminton();
  const [showLocalSetup, setShowLocalSetup] = useState(false);
  const [player2Name, setPlayer2Name] = useState("");
  
  const handlePlayAI = () => {
    startNewGame("ai", currentUser || "Player 1", "CPU");
  };
  
  const handlePlayLocal = () => {
    if (player2Name.trim()) {
      startNewGame("local", currentUser || "Player 1", player2Name);
      setShowLocalSetup(false);
      setPlayer2Name("");
    }
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-green-800 to-green-950">
      <div className="bg-white/95 rounded-2xl p-8 shadow-2xl w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Badminton</h1>
          <p className="text-gray-600">Welcome, <span className="font-semibold text-green-700">{currentUser}</span>!</p>
        </div>
        
        {!showLocalSetup ? (
          <div className="space-y-4">
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
            
            <div className="pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={logout}
                className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition"
              >
                Sign Out
              </button>
            </div>
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
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
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
