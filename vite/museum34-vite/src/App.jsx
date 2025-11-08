import './App.css';
import MuseumVirtual from './VRComponents/MuseumVirtual.jsx';
import LoginSignUp from './components/learn/LoginSignUp.jsx';

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<MuseumVirtual />} />
        <Route path="/iniciar-sesion" element={<LoginSignUp isLogin={true} />} />
        <Route path="/registrarse" element={<LoginSignUp isLogin={false} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
