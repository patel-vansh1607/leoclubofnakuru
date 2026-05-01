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
  const [tournamentDropdown, setTournamentDropdown] = useState(false);

  const leoLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572486/7932664-03_scur6z.png";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session?.user?.id).single();
        setUserRole(profile?.role || 'viewer');

        const { data: items } = await supabase.from('nav_items').select('*').order('sort_order', { ascending: true });
        setNavItems(items || []);
      } catch (err) {
        console.error("Database fetch error:", err);
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
      case 'teams': return <div className={s.placeholder}><h3>Teams</h3><p>Manage Leo Cup Squads</p></div>;
      case 'venues': return <div className={s.placeholder}><h3>Venues</h3><p>Manage Pitch Locations</p></div>;
      case 'overview': return <div className={s.placeholder}><h3>Overview</h3><p>Welcome to the portal.</p></div>;
      default: return <div className={s.placeholder}><h3>{view.toUpperCase()}</h3><p>Module active.</p></div>;
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
              {/* 1. OVERVIEW BUTTON */}
              <button 
                className={view === 'overview' ? s.active : s.link} 
                onClick={() => { setView('overview'); setTournamentDropdown(false); }}
              >
                <FontAwesomeIcon icon={Icons.faChartPie} className={s.icon} /> 
                <span>Overview</span>
              </button>

              {/* 2. ROLE ACCESS BUTTON - Hardcoded to ensure it stays! */}
              <button 
                className={view === 'roles' ? s.active : s.link} 
                onClick={() => { setView('roles'); setTournamentDropdown(false); }}
              >
                <FontAwesomeIcon icon={Icons.faUserShield} className={s.icon} /> 
                <span>Role Access</span>
              </button>

              {/* 3. DYNAMIC DB ITEMS */}
              {navItems.filter(i => i.view_key !== 'roles' && i.view_key !== 'overview').map((item) => (
                <button 
                  key={item.view_key}
                  className={view === item.view_key ? s.active : s.link} 
                  onClick={() => { setView(item.view_key); setTournamentDropdown(false); }}
                >
                  <FontAwesomeIcon icon={Icons[item.icon_name] || Icons.faCircle} className={s.icon} /> 
                  <span>{item.label}</span>
                </button>
              ))}

              {/* 4. TOURNAMENT DROPDOWN */}
              <div className={s.dropdownContainer}>
                <button 
                  className={(['teams', 'venues'].includes(view) || tournamentDropdown) ? s.active : s.link} 
                  onClick={() => setTournamentDropdown(!tournamentDropdown)}
                >
                  <FontAwesomeIcon icon={Icons.faTrophy} className={s.icon} />
                  <span>Tournament</span>
                  <FontAwesomeIcon 
                    icon={Icons.faChevronDown} 
                    className={`${s.chevron} ${tournamentDropdown ? s.chevronRotate : ''}`} 
                  />
                </button>
                
                <div className={`${s.dropdownMenu} ${tournamentDropdown ? s.menuOpen : ''}`}>
                  <button className={view === 'teams' ? s.dropdownLinkActive : s.dropdownLink} onClick={() => setView('teams')}>
                    <FontAwesomeIcon icon={Icons.faShieldHalved} className={s.subIcon} />
                    <span>Teams</span>
                  </button>
                  <button className={view === 'venues' ? s.dropdownLinkActive : s.dropdownLink} onClick={() => setView('venues')}>
                    <FontAwesomeIcon icon={Icons.faMapLocationDot} className={s.subIcon} />
                    <span>Venues</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>

          {/* SIDEBAR FOOTER */}
          <div className={s.sidebarFooter}>
            <div className={s.userBadge}>
              <div className={s.avatar}>{session?.user?.email?.charAt(0).toUpperCase()}</div>
              <div className={s.userInfo}>
                <p className={s.uRole}>{userRole.replace('_', ' ')}</p>
                <p className={s.uEmail}>{session?.user?.email}</p>
              </div>
            </div>
            <button className={confirmLogout ? s.logoutConfirmBtn : s.logoutBtn} onClick={handleLogout}>
              <FontAwesomeIcon icon={confirmLogout ? Icons.faCheck : Icons.faPowerOff} />
              <span>{confirmLogout ? "Confirm?" : "Log Out"}</span>
            </button>
          </div>
        </div>
      </aside>

      <main className={s.main}>
        <div className={s.card}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;