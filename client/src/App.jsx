import { BrowserRouter, Routes, Route } from 'react-router-dom';


// Import our page components
import Home from './pages/Home';
import Matchmaking from './pages/Matchmaking';
import CustomRoom from './pages/CustomRoom';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/matchmaking" element={<Matchmaking />} />
        <Route path="/custom-room" element={<CustomRoom />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;