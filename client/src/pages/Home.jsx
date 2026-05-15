import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      
      {/* Header / Profile Section */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12 p-4 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>Chess Game</h1>
        {/* We make the profile area clickable to go to the Profile page! */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-4 cursor-pointer hover:bg-gray-700 p-2 rounded transition-colors"
        >
          <div className="text-right">
            <p className="font-semibold">Player_01</p>
            <p className="text-sm text-yellow-400">1200 ELO</p>
          </div>
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-xl">
            👤
          </div>
        </div>
      </header>

      {/* Main Action Buttons */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => navigate('/matchmaking')}
          className="h-48 bg-blue-600 hover:bg-blue-500 rounded-xl text-2xl font-bold transition-all shadow-lg flex flex-col items-center justify-center gap-2"
        >
          <span>⚔️</span> Play Ranked
        </button>
        
        {/* Both of these now send the user to the Custom Room lobby area */}
        <button 
          onClick={() => navigate('/custom-room')}
          className="h-48 bg-green-600 hover:bg-green-500 rounded-xl text-2xl font-bold transition-all shadow-lg flex flex-col items-center justify-center gap-2"
        >
          <span>🚪</span> Custom Rooms
        </button>
        
        <button 
          className="h-48 bg-gray-700 hover:bg-gray-600 rounded-xl text-2xl font-bold transition-all shadow-lg flex flex-col items-center justify-center gap-2"
        >
          <span>📚</span> Tutorials
        </button>
      </main>
    </div>
  );
}

export default Home;