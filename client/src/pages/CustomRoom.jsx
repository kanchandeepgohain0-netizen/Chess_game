import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CustomRoom() {
  const navigate = useNavigate();

  // Modal toggles
  const [isRoomCreate, setIsRoomCreate] = useState(false);
  const [isRoomJoin, setIsRoomJoin] = useState(false);

  // Form inputs
  const [roomCode, setRoomCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createFormat, setCreateFormat] = useState("Classical");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      
      {/* Header Area */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12 p-4 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold">Custom Room Lobby</h2>
        
        <button 
          onClick={() => navigate('/')} 
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold transition-colors"
        >
          Back to Home
        </button>
      </header>

      {/* Main Action Buttons */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => setIsRoomCreate(true)}
          className="h-48 bg-green-600 hover:bg-green-500 rounded-xl text-2xl font-bold transition-all shadow-lg flex flex-col items-center justify-center gap-2"
        >
          <span>➕</span> Create New Room
        </button>
        
        <button 
          onClick={() => setIsRoomJoin(true)}
          className="h-48 bg-purple-600 hover:bg-purple-500 rounded-xl text-2xl font-bold transition-all shadow-lg flex flex-col items-center justify-center gap-2"
        >
          <span>🤝</span> Join Room
        </button>
      </main>

      {/* --- MODALS (Copied exactly from your earlier logic) --- */}

      {/* Create Room Modal */}
      {isRoomCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md w-full flex flex-col gap-4">
            <h3 className="text-2xl font-bold mb-4 text-center">Create Custom Room</h3>
            
            <div className="flex gap-2">
              {['classical', 'rapid', 'blitz' ].map((fmt) => (
                <button 
                  key={fmt}
                  onClick={() => setCreateFormat(fmt)}
                  className={`flex-1 py-2 rounded-lg font-semibold capitalize ${createFormat === fmt ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <input 
              type="password" 
              placeholder="Create Room Password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              className="mt-4 p-3 bg-gray-900 border border-gray-600 rounded-lg text-white"
            />
            
            <button className="mt-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold">Create & Enter Lobby</button>
            <button onClick={() => setIsRoomCreate(false)} className="mt-2 text-gray-400 hover:text-white text-center">Cancel</button>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {isRoomJoin && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md w-full flex flex-col gap-4">
            <h3 className="text-2xl font-bold mb-4 text-center">Join Friend's Room</h3>
            
            <input 
              type="text" 
              placeholder="Enter Room Code (e.g. XYZ-123)"
              value={roomCode} 
              onChange={(e) => setRoomCode(e.target.value)}
              className="p-3 bg-gray-900 border border-gray-600 rounded-lg text-white uppercase"
            />
            
            <input 
              type="password" 
              placeholder="Enter Password"
              value={joinPassword} 
              onChange={(e) => setJoinPassword(e.target.value)}
              className="p-3 bg-gray-900 border border-gray-600 rounded-lg text-white"
            />
            
            <button className="mt-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold">Join Match</button>
            <button onClick={() => setIsRoomJoin(false)} className="mt-2 text-gray-400 hover:text-white text-center">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomRoom;