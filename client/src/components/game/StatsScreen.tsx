import { useEffect } from "react";
import { useBadminton } from "@/lib/stores/useBadminton";

export function StatsScreen() {
  const { currentUser, matchHistory, setScreen, loadMatchHistory } = useBadminton();
  
  useEffect(() => {
    loadMatchHistory();
  }, [loadMatchHistory]);
  
  const winRate = currentUser && (currentUser.wins + currentUser.losses) > 0
    ? Math.round((currentUser.wins / (currentUser.wins + currentUser.losses)) * 100)
    : 0;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-green-800 to-green-950 overflow-auto py-8">
      <div className="bg-white/95 rounded-2xl p-8 shadow-2xl w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Your Stats</h1>
          <p className="text-gray-600">{currentUser?.username}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-700">{currentUser?.wins || 0}</div>
            <div className="text-sm text-green-600">Wins</div>
          </div>
          <div className="bg-red-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-700">{currentUser?.losses || 0}</div>
            <div className="text-sm text-red-600">Losses</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">{winRate}%</div>
            <div className="text-sm text-blue-600">Win Rate</div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Recent Matches</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {matchHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No matches played yet</p>
            ) : (
              matchHistory.map((match) => {
                const won = match.winnerId === currentUser?.id;
                const date = new Date(match.playedAt).toLocaleDateString();
                
                return (
                  <div 
                    key={match.id}
                    className={`p-3 rounded-lg flex justify-between items-center ${
                      won ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div>
                      <span className={`font-medium ${won ? "text-green-700" : "text-red-700"}`}>
                        {won ? "WIN" : "LOSS"}
                      </span>
                      <span className="text-gray-600 text-sm ml-2">
                        vs {match.gameMode === "ai" ? `CPU (${match.aiDifficulty})` : "Friend"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">
                        {match.player1Score} - {match.player2Score}
                      </div>
                      <div className="text-xs text-gray-500">{date}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <button
          onClick={() => setScreen("menu")}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
