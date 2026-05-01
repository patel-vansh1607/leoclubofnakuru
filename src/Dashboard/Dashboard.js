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
  const [loading, setLoading] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [tournamentDropdown, setTournamentDropdown] = useState(false);

  const leoLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572486/7932664-03_scur6z.png";
  const isTournamentActive = ['teams', 'venues'].includes(view);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session?.user?.id).single();
        setUserRole(profile?.role || 'viewer');

        const { data: items } = await supabase.from('nav_items').select('*').order('sort_order', { ascending: true });
        setNavItems(items || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
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

  // Logic to handle main nav clicks
  const handleMainNavLink = (viewKey) => {
    setView(viewKey);
    setTournamentDropdown(false); // Force close dropdown when going back to Roles/Overview
  };

  const renderContent = () => {
    switch (view) {
      case 'roles': return <RoleManagement session={session} />;
      case 'teams': return <div className={s.placeholder}><h3>Teams</h3><p>Manage Leo Cup Squads</p></div>;
      case 'venues': return <div className={s.placeholder}><h3>Venues</h3><p>Manage Pitch Locations</p></div>;
      default: return <div className={s.placeholder}><h3>Dashboard</h3><p>Welcome to the portal.</p></div>;
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
              {/* Dynamic items (Roles, Overview, etc.) */}
              {navItems.map((item) => (
                <button 
                  key={item.view_key}
                  className={view === item.view_key ? s.active : s.link} 
                  onClick={() => handleMainNavLink(item.view_key)}
                >
                  <FontAwesomeIcon icon={Icons[item.icon_name] || Icons.faCircle} className={s.icon} /> 
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Tournament Dropdown */}
              <div className={s.dropdownContainer}>
                <button 
                  className={(tournamentDropdown || isTournamentActive) ? s.active : s.link} 
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
                  <button 
                    className={view === 'teams' ? s.dropdownLinkActive : s.dropdownLink} 
                    onClick={() => setView('teams')}
                  >
                    <FontAwesomeIcon icon={Icons.faShieldHalved} className={s.subIcon} />
                    <span>Teams</span>
                  </button>
                  <button 
                    className={view === 'venues' ? s.dropdownLinkActive : s.dropdownLink} 
                    onClick={() => setView('venues')}
                  >
                    <FontAwesomeIcon icon={Icons.faMapLocationDot} className={s.subIcon} />
                    <span>Venues</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>

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