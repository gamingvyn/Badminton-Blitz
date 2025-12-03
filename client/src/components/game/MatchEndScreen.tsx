import { useBadminton } from "@/lib/stores/useBadminton";

export function MatchEndScreen() {
  const { player1, player2, winner, resetMatch, startNewGame, gameMode } = useBadminton();
  
  const winnerName = winner === 1 ? player1.name : player2.name;
  const winnerScore = winner === 1 ? player1.score : player2.score;
  const loserScore = winner === 1 ? player2.score : player1.score;
  
  const handlePlayAgain = () => {
    startNewGame(gameMode, player1.name, player2.name);
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
      <div className="bg-white/95 rounded-2xl p-8 shadow-2xl w-full max-w-md mx-4 text-center">
        <div className="text-6xl mb-4">🏆</div>
        
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          {winnerName} Wins!
        </h1>
        
        <div className="text-5xl font-bold text-gray-800 my-6">
          {winnerScore} - {loserScore}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handlePlayAgain}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Play Again
          </button>
          
          <button
            onClick={resetMatch}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
