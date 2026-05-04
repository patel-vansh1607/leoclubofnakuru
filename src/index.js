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
import RoleManagement from './RoleManagement/RoleManagement'; // Line 11

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
            
            {/* Replace these <div> tags once you have the specific submission/approval files ready */}
            <Route path="submissions" element={<div>Submissions Page</div>} />
            <Route path="approvals" element={<div>Approvals Page</div>} />
            
            <Route path="teams" element={<TeamGallery />} /> 
            
            {/* Line 43: Properly using your imported RoleManagement component */}
            <Route path="roles" element={<RoleManagement />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);