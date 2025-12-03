import { useBadminton } from "@/lib/stores/useBadminton";

export function GameHUD() {
  const { player1, player2, servingPlayer, isServing } = useBadminton();
  
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none">
      <div className="flex justify-between items-start p-4">
        <div className={`bg-black/70 rounded-lg p-4 min-w-[150px] ${servingPlayer === 1 ? 'ring-2 ring-yellow-400' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">{player1.name}</span>
            {servingPlayer === 1 && <span className="text-yellow-400 text-sm">🏸</span>}
          </div>
          <div className="text-4xl font-bold text-white">{player1.score}</div>
        </div>
        
        <div className="bg-black/70 rounded-lg px-6 py-2 mt-2">
          <span className="text-white font-medium">First to 21</span>
        </div>
        
        <div className={`bg-black/70 rounded-lg p-4 min-w-[150px] text-right ${servingPlayer === 2 ? 'ring-2 ring-yellow-400' : ''}`}>
          <div className="flex items-center justify-end gap-2">
            {servingPlayer === 2 && <span className="text-yellow-400 text-sm">🏸</span>}
            <span className="text-white font-bold text-lg">{player2.name}</span>
          </div>
          <div className="text-4xl font-bold text-white">{player2.score}</div>
        </div>
      </div>
      
      {isServing && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-black/80 rounded-xl px-8 py-4 text-center">
            <p className="text-white text-xl font-bold mb-2">
              {servingPlayer === 1 ? player1.name : player2.name}'s Serve
            </p>
            {servingPlayer === 1 && (
              <p className="text-gray-300 text-sm">
                Press Z (smash) or X (lob) to serve
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
