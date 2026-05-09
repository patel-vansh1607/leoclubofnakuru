import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './index.css';

// --- IMPORTS ---
import App from './App';
import Home from './Home/Home';
import Registration from './Registration/Registration';
import TeamGallery from './TeamGallery/TeamGallery'; 
import PlayerProfile from './PlayerProfile/PlayerProfile'; 
import Login from './Login/Login'; 
import Signup from './SignUp/Signup'; 
import VerifyOTP from './VerifyOTP/VerifyOTP'; 
import SetPassword from './SetPassword/SetPassword'; 
import Dashboard from './Dashboard/Dashboard';
import RoleManagement from './RoleManagement/RoleManagement';
import DraftTeams from './DraftTeams/DraftTeams';
import AddTeam from './AddTeam/AddTeam';
import PlayingTeams from './PlayingTeams/PlayingTeams'; 
import TeamDetails from './TeamDetails/TeamDetails';
import ScorerVerify from './ScoreVerify/ScoreVerify';
import ScoringTerminal from './ScoringTerminal/ScoringTerminal'; 
import QuickQR from './QuickQR/QuickQR';
import About from './AboutUs/AboutUs'; 
import Maintenance from './Maintenance/Maintenance';
import Contact from './Contact/Contact';
import Messages from './Messages/Messages';

const IS_MAINTENANCE_MODE = false; 

// --- THE GATEKEEPER ---
const Gatekeeper = ({ children }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole('guest');
      } else {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setRole(data?.role || 'unauthorized');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin'; 
  };

if (loading) {
  return (
    <div className="loaderContainer">
      <div className="scannerLine"></div>
      <div className="loaderContent">
        <div className="glitchText" data-text="SYSTEM_CHECKING...">
          LOADING...
        </div>
        <div className="progressBar">
          <div className="progressFill"></div>
        </div>
        <p className="loaderSub">ESTABLISHING SECURE PROTOCOLS</p>
      </div>
    </div>
  );
}  if (role === 'guest') return <Navigate to="/admin" />;
  
  if (role === 'unauthorized') {
    return (
      <div style={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', padding: '20px' }}>
        <div style={{ maxWidth: '450px', width: '100%' }}>
          <h1 style={{ color: '#ff4d4d', fontSize: '3.5rem', fontWeight: '900', margin: '0', textShadow: '0 0 20px rgba(255, 77, 77, 0.4)' }}>ACCESS_LOCKED</h1>
          <p style={{ opacity: 0.6, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem', marginTop: '10px' }}>Verification Successful / Authorization Required</p>
          
          <div style={{ marginTop: '30px', padding: '30px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 77, 77, 0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Your credentials are valid, but your account level is currently <strong>UNAUTHORIZED</strong>.
            </p>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '10px' }}>
              Contact the Master Admin to grant system clearance.
            </p>
            
            <button 
              onClick={handleLogout}
              style={{ 
                marginTop: '25px', 
                background: 'transparent', 
                border: '1px solid #444', 
                color: '#888', 
                padding: '12px 24px', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                transition: '0.3s'
              }}
              onMouseOver={(e) => { e.target.style.borderColor = '#fff'; e.target.style.color = '#fff'; }}
              onMouseOut={(e) => { e.target.style.borderColor = '#444'; e.target.style.color = '#888'; }}
            >
              LOGOUT TERMINAL
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// --- PAGE TITLE UPDATER ---
const PageTitleUpdater = () => {
  const location = useLocation();
  useEffect(() => {
    const routeTitles = {
      '/': 'Home | Leo Football Cup 2026',
      '/about': 'About Us | Leo Football Cup 2026',
      '/registration': 'Register | Leo Football Cup 2026',
      '/rosters': 'Team Rosters | Leo Football Cup 2026',
      '/admin': 'Admin Login | Leo Football Cup 2026',
      '/signup': 'Identification | Leo Football Cup 2026',
      '/signup/verify': 'Verification | Leo Football Cup 2026',
      '/signup/password': 'Security Setup | Leo Football Cup 2026',
      '/dashboard': 'Overview | Leo Football Cup 2026', 
      '/dashboard/scoring': 'Match Scoring | Leo Football Cup 2026', 
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
          
          <Route path="signup">
            <Route index element={<Signup />} />
            <Route path="verify" element={<VerifyOTP />} />
            <Route path="password" element={<SetPassword />} />
          </Route>
          
          <Route path="qr" element={<QuickQR />} />
          
          {/* PROTECTED DASHBOARD */}
          <Route path="dashboard" element={<Gatekeeper><Dashboard /></Gatekeeper>}>
            <Route path="teams" element={<TeamGallery />} /> 
            <Route path="verify-player" element={<ScorerVerify />} />
            <Route path="scoring" element={<ScoringTerminal />} /> 
            <Route path="add-team" element={<AddTeam />} />
            <Route path="playing-teams" element={<PlayingTeams />} />
            <Route path="playing-teams/:teamId" element={<TeamDetails />} />
            <Route path="messages" element={<Messages />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="draft-teams" element={<DraftTeams />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);