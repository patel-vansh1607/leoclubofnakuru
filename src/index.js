import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Registration from './Registration/Registration';
import TeamGallery from './TeamGallery/TeamGallery'; 
import PlayerProfile from './PlayerProfile/PlayerProfile'; 
import Login from './Login/Login'; 
import Dashboard from './Dashboard/Dashboard';
import RoleManagement from './RoleManagement/RoleManagement';
import DraftTeams from './DraftTeams/DraftTeams';
import AddTeam from './AddTeam/AddTeam';
import PlayingTeams from './PlayingTeams/PlayingTeams'; 
import TeamDetails from './TeamDetails/TeamDetails'; // Import the new Detail component

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<div style={{ textAlign: 'center', padding: '100px' }}><h1>Leo Cup Home</h1></div>} />
          <Route path="registration" element={<Registration />} />
          <Route path="rosters" element={<TeamGallery />} />
          <Route path="profile/:playerId" element={<PlayerProfile />} />
          <Route path="admin" element={<Login />} />
          
          {/* Dashboard Nested Routing */}
          <Route path="dashboard" element={<Dashboard />}>
            <Route index element={<div style={{padding: '20px'}}><h2>DASHBOARD OVERVIEW</h2></div>} />
            
            <Route path="submissions" element={<div>Submissions Page</div>} />
            <Route path="approvals" element={<div>Approvals Page</div>} />
            
            <Route path="teams" element={<TeamGallery />} /> 
            <Route path="draft-teams" element={<DraftTeams />} />
            <Route path="add-team" element={<AddTeam />} />
            
            {/* --- OVERSIGHT ROUTES --- */}
            {/* List View: http://localhost:3000/dashboard/playing-teams */}
            <Route path="playing-teams" element={<PlayingTeams />} />
            
            {/* Detail View: http://localhost:3000/dashboard/playing-teams/afcae177... */}
            <Route path="playing-teams/:teamId" element={<TeamDetails />} />
            
            <Route path="roles" element={<RoleManagement />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);