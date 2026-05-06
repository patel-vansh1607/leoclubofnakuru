import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import TeamDetails from './TeamDetails/TeamDetails';
import ScorerVerify from './ScoreVerify/ScoreVerify';

/**
 * Component to handle dynamic browser tab titles for the 2026 Tournament.
 */
const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const routeTitles = {
      '/': 'Home | Leo Football Cup 2026',
      '/registration': 'Register | Leo Football Cup 2026',
      '/rosters': 'Team Rosters | Leo Football Cup 2026',
      '/admin': 'Admin Login | Leo Football Cup 2026',
      '/dashboard': 'Dashboard | Leo Football Cup 2026',
      '/dashboard/submissions': 'Submissions | Leo Football Cup 2026',
      '/dashboard/approvals': 'Approvals | Leo Football Cup 2026',
      '/dashboard/teams': 'Teams List | Leo Football Cup 2026',
      '/dashboard/verify-player': 'Verify Player | Leo Football Cup 2026',
      '/dashboard/add-team': 'Add Team | Leo Football Cup 2026',
      '/dashboard/playing-teams': 'Tournament Teams | Leo Football Cup 2026',
      '/dashboard/roles': 'Role Management | Leo Football Cup 2026',
      '/dashboard/draft-teams': 'Draft Board | Leo Football Cup 2026',
      '/dashboard/master-oversight': 'Master Oversight | Leo Football Cup 2026',
    };

    // Logic for dynamic segments like player IDs or specific team pages
    if (location.pathname.startsWith('/profile/')) {
      document.title = 'Player Profile | Leo Football Cup 2026';
    } else if (location.pathname.includes('/playing-teams/')) {
      document.title = 'Team Details | Leo Football Cup 2026';
    } else {
      document.title = routeTitles[location.pathname] || 'Leo Football Cup 2026';
    }
  }, [location]);

  return null;
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <PageTitleUpdater />
      <Routes>
        <Route path="/" element={<App />}>
          {/* Main Public Routes */}
          <Route index element={<div style={{ textAlign: 'center', padding: '100px' }}><h1>Leo Football Cup 2026 Home</h1></div>} />
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
            
            {/* Scorer Tools */}
            <Route path="verify-player" element={<ScorerVerify />} />
            
            {/* Management Routes */}
            <Route path="add-team" element={<AddTeam />} />
            <Route path="playing-teams" element={<PlayingTeams />} />
            <Route path="playing-teams/:teamId" element={<TeamDetails />} />
            
            {/* Master Admin / Vansh Only Routes */}
            <Route path="master-oversight" element={<div>Master Admin Control Panel</div>} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="draft-teams" element={<DraftTeams />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);