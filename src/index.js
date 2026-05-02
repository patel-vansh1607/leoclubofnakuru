import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Registration from './Registration/Registration';
import TeamGallery from './TeamGallery/TeamGallery'; // Import Gallery
import PlayerProfile from './PlayerProfile/PlayerProfile'; // Import Profile
import Login from './Login/Login'; 
import Dashboard from './Dashboard/Dashboard';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

const Home = () => (
  <div style={{ padding: '100px', textAlign: 'center' }}>
    <h1>Leo Cup Home</h1>
  </div>
);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="registration" element={<Registration />} />
          
          {/* Public Route: View all Boys and Girls teams */}
          <Route path="rosters" element={<TeamGallery />} />
          
          {/* Public/Admin Route: View individual player ID info */}
          <Route path="profile/:playerId" element={<PlayerProfile />} />
          
          <Route path="admin" element={<Login />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();