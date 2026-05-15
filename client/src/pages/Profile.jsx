import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  // Mock Data: This will eventually be fetched from your MongoDB database!
  const player = {
    username: "Player_01",
    uid: "A1B2C3D4E5F6",
    elo: 1200,
    wins: 0,
    losses: 0,
    draws: 0
  };

  // Automatically calculate total games and win rate
  const totalGames = player.wins + player.losses + player.draws;
  const winRate = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      
      {/* Header Area */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12 p-4 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold">Player Profile</h2>
        <button 
          onClick={() => navigate('/')} 
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold transition-colors"
        >
          Back to Home
        </button>
      </header>

      {/* Profile Card */}
      <main className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full flex flex-col items-center mt-4">
        
        {/* Large Centered Avatar */}
        <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center text-6xl mb-4 border-4 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          👤
        </div>
        
        {/* Identity */}
        <h3 className="text-3xl font-bold">{player.username}</h3>
        <p className="text-gray-400 font-mono tracking-widest mb-8 mt-1">UID: {player.uid}</p>

        {/* Top Stats: ELO and Win Rate */}
        <div className="w-full grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg text-center shadow-inner">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">ELO Rating</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">{player.elo}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center shadow-inner">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Win Rate</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">{winRate}%</p>
          </div>
        </div>

        {/* Match History Breakdown */}
        <div className="w-full flex justify-between bg-gray-900 rounded-lg p-4 text-center border border-gray-700">
          <div className="flex-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Wins</p>
            <p className="text-xl font-bold text-green-500">{player.wins}</p>
          </div>
          <div className="flex-1 border-x border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Losses</p>
            <p className="text-xl font-bold text-red-500">{player.losses}</p>
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Draws</p>
            <p className="text-xl font-bold text-gray-300">{player.draws}</p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Profile;