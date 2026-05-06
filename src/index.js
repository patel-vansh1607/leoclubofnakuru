import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './Home/Home';
import Registration from './Registration/Registration';
import TeamGallery from './TeamGallery/TeamGallery'; 
import PlayerProfile from './PlayerProfile/PlayerProfile'; 
import Login from './Login/Login'; 
import Dashboard from './Dashboard/Dashboard';
import RoleManagement from './RoleManagement/RoleManagement';
import DraftTeams from './DraftTeams/DraftTeams';
import AddTeam from './AddTeam/AddTeam';
import PlayingTeams from './PlayingTeams/PlayingTeams'; 
import TeamDetails from './TeamDetails/TeamDetails';
import ScorerVerify from './ScoreVerify/ScoreVerify';
import QuickQR from './QuickQR/QuickQR';
import About from './AboutUs/AboutUs'; 
import Maintenance from './Maintenance/Maintenance';
import Contact from './Contact/Contact';
import Messages from './Messages/Messages'; // [Step 1: Import the new component]

const IS_MAINTENANCE_MODE = false; 

const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const routeTitles = {
      '/': 'Home | Leo Football Cup 2026',
      '/about': 'About Us | Leo Football Cup 2026',
      '/registration': 'Register | Leo Football Cup 2026',
      '/rosters': 'Team Rosters | Leo Football Cup 2026',
      '/admin': 'Admin Login | Leo Football Cup 2026',
      '/qr': 'QR Generator | Leo Football Cup 2026',
      '/dashboard': 'Dashboard | Leo Football Cup 2026',
      '/dashboard/roles': 'Role Management | Leo Football Cup 2026',
      '/dashboard/verify-player': 'Secure Scanner | Leo Football Cup 2026',
      '/dashboard/messages': 'Contact Inquiries | Leo Football Cup 2026', // [Step 2: Add Title]
      '/contact': 'Contact Us | Leo Football Cup 2026',
    };
    document.title = routeTitles[location.pathname] || 'Leo Football Cup 2026';
  }, [location]);

  return null;
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {IS_MAINTENANCE_MODE && <Maintenance />}
    
    <Router>
      <PageTitleUpdater />
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} /> 
          
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="registration" element={<Registration />} />
          <Route path="rosters" element={<TeamGallery />} />
          <Route path="profile/:playerId" element={<PlayerProfile />} />
          <Route path="admin" element={<Login />} />
          <Route path="qr" element={<QuickQR />} />
          
          <Route path="dashboard" element={<Dashboard />}>
            <Route index element={<div style={{padding: '20px', color: 'white'}}><h2>DASHBOARD OVERVIEW</h2></div>} />
            <Route path="submissions" element={<div>Submissions Page</div>} />
            <Route path="approvals" element={<div>Approvals Page</div>} />
            <Route path="teams" element={<TeamGallery />} /> 
            <Route path="verify-player" element={<ScorerVerify />} />
            <Route path="add-team" element={<AddTeam />} />
            <Route path="playing-teams" element={<PlayingTeams />} />
            <Route path="playing-teams/:teamId" element={<TeamDetails />} />
            
            {/* [Step 3: Add the Messages Route] */}
            <Route path="messages" element={<Messages />} />

            <Route path="master-oversight" element={<div>Master Admin Control Panel</div>} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="draft-teams" element={<DraftTeams />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);