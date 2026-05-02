import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';

import RoleManagement from '../RoleManagement/RoleManagement';
import s from './Dashboard.module.css';

const Dashboard = ({ session }) => {
  const [view, setView] = useState('overview');
  const [navItems, setNavItems] = useState([]);
  const [userRole, setUserRole] = useState('viewer');
  const [confirmLogout, setConfirmLogout] = useState(false);
  
  // State for different dropdowns
  const [tournamentDropdown, setTournamentDropdown] = useState(false);
  const [matchesDropdown, setMatchesDropdown] = useState(false);

  const leoLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572486/7932664-03_scur6z.png";

  const isTournamentActive = ['teams', 'venues'].includes(view);
  const isMatchesActive = ['match-list', 'add-match'].includes(view);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session?.user?.id).single();
        setUserRole(profile?.role || 'viewer');
        const { data: items } = await supabase.from('nav_items').select('*').order('sort_order', { ascending: true });
        setNavItems(items || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (session?.user?.id) fetchData();
  }, [session]);

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3000);
      return;
    }
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    switch (view) {
      case 'roles': return <RoleManagement session={session} />;
      case 'match-list': return <div className={s.placeholder}><h3>Match List</h3><p>Viewing all scheduled matches.</p></div>;
      case 'add-match': return <div className={s.placeholder}><h3>Add New Match</h3><p>Form to create a match will go here.</p></div>;
      case 'teams': return <div className={s.placeholder}><h3>Teams</h3><p>Manage Squads</p></div>;
      case 'venues': return <div className={s.placeholder}><h3>Venues</h3><p>Manage Locations</p></div>;
      default: return <div className={s.placeholder}><h3>Overview</h3><p>Welcome to the portal.</p></div>;
    }
  };

  return (
    <div className={s.layout}>
      <aside className={s.sidebar}>
        <div className={s.sidebarInner}>
          <div className={s.topSection}>
            <div className={s.brand}>
              <div className={s.logoContainer}><img src={leoLogo} alt="Logo" className={s.logoImg} /></div>
              <div className={s.brandText}>LEO<span>CUP</span></div>
            </div>

            <nav className={s.nav}>
              {/* Main Links */}
              <button className={view === 'overview' ? s.active : s.link} onClick={() => { setView('overview'); setTournamentDropdown(false); setMatchesDropdown(false); }}>
                <FontAwesomeIcon icon={Icons.faChartPie} className={s.icon} /> <span>Overview</span>
              </button>
              
              <button className={view === 'roles' ? s.active : s.link} onClick={() => { setView('roles'); setTournamentDropdown(false); setMatchesDropdown(false); }}>
                <FontAwesomeIcon icon={Icons.faUserShield} className={s.icon} /> <span>Role Access</span>
              </button>

              {/* Matches Dropdown */}
              <div className={s.dropdownContainer}>
                <button 
                  className={(matchesDropdown || isMatchesActive) ? s.active : s.link} 
                  onClick={() => { setMatchesDropdown(!matchesDropdown); setTournamentDropdown(false); }}
                >
                  <FontAwesomeIcon icon={Icons.faCalendarDays} className={s.icon} />
                  <span>Matches</span>
                  <FontAwesomeIcon icon={Icons.faChevronDown} className={`${s.chevron} ${matchesDropdown ? s.chevronRotate : ''}`} />
                </button>
                <div className={`${s.dropdownMenu} ${matchesDropdown || isMatchesActive ? s.menuOpen : ''}`}>
                  <button className={view === 'match-list' ? s.dropdownLinkActive : s.dropdownLink} onClick={() => setView('match-list')}>
                    <FontAwesomeIcon icon={Icons.faListCheck} className={s.subIcon} /> <span>All Matches</span>
                  </button>
                  <button className={view === 'add-match' ? s.dropdownLinkActive : s.dropdownLink} onClick={() => setView('add-match')}>
                    <FontAwesomeIcon icon={Icons.faPlus} className={s.subIcon} /> <span>Add Match</span>
                  </button>
                </div>
              </div>

              {/* Tournament Dropdown */}
              <div className={s.dropdownContainer}>
                <button 
                  className={(tournamentDropdown || isTournamentActive) ? s.active : s.link} 
                  onClick={() => { setTournamentDropdown(!tournamentDropdown); setMatchesDropdown(false); }}
                >
                  <FontAwesomeIcon icon={Icons.faTrophy} className={s.icon} />
                  <span>Tournament</span>
                  <FontAwesomeIcon icon={Icons.faChevronDown} className={`${s.chevron} ${tournamentDropdown ? s.chevronRotate : ''}`} />
                </button>
                <div className={`${s.dropdownMenu} ${tournamentDropdown || isTournamentActive ? s.menuOpen : ''}`}>
                  <button className={view === 'teams' ? s.dropdownLinkActive : s.dropdownLink} onClick={() => setView('teams')}>
                    <FontAwesomeIcon icon={Icons.faShieldHalved} className={s.subIcon} /> <span>Teams</span>
                  </button>
                  <button className={view === 'venues' ? s.dropdownLinkActive : s.dropdownLink} onClick={() => setView('venues')}>
                    <FontAwesomeIcon icon={Icons.faMapLocationDot} className={s.subIcon} /> <span>Venues</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>

          <div className={s.sidebarFooter}>
            <button className={confirmLogout ? s.logoutConfirmBtn : s.logoutBtn} onClick={handleLogout}>
              <FontAwesomeIcon icon={confirmLogout ? Icons.faCheck : Icons.faPowerOff} />
              <span>{confirmLogout ? "Confirm?" : "Log Out"}</span>
            </button>
          </div>
        </div>
      </aside>

      <main className={s.main}>
        <div className={s.card}>{renderContent()}</div>
      </main>
    </div>
  );
};

export default Dashboard;