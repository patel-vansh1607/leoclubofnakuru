import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';

// Import your sub-components here
import RoleManagement from '../RoleManagement/RoleManagement';
// import MatchManager from '../Matches/MatchManager';
// import PlayerDatabase from '../Players/PlayerDatabase';

import s from './Dashboard.module.css';

const Dashboard = ({ session }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState('overview');
  const [navItems, setNavItems] = useState([]);
  const [userRole, setUserRole] = useState('viewer');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const leoLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572486/7932664-03_scur6z.png";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session?.user?.id)
          .single();
        
        const currentRole = profile?.role || 'viewer';
        setUserRole(currentRole);

        const { data: items } = await supabase
          .from('nav_items')
          .select('*')
          .order('sort_order', { ascending: true });

        const roleWeights = { 
          'viewer': 1, 
          'editor': 2, 
          'admin': 3, 
          'super_admin': 4,
          'master_admin': 4 
        };

        const userWeight = roleWeights[currentRole] || 1;

        let allowedItems = (items || []).filter(item => {
          const requiredWeight = roleWeights[item.required_role] || 1;
          return userWeight >= requiredWeight;
        });

        // Fallback if DB is empty
        if (allowedItems.length === 0) {
          allowedItems = [
            { label: 'Overview', view_key: 'overview', icon_name: 'faThLarge', required_role: 'viewer' },
            { label: 'Matches', view_key: 'matches', icon_name: 'faCalendarCheck', required_role: 'master_admin' },
            { label: 'Players', view_key: 'players', icon_name: 'faUsers', required_role: 'master_admin' },
            { label: 'Roles', view_key: 'roles', icon_name: 'faUserLock', required_role: 'master_admin' }
          ].filter(item => userWeight >= roleWeights[item.required_role]);
        }

        setNavItems(allowedItems);
      } catch (err) {
        console.error("Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user?.id) fetchData();
  }, [session]);

  // RENDER LOGIC FOR EACH VIEW
  const renderContent = () => {
    switch (view) {
      case 'overview':
        return (
          <div className={s.card}>
            <h3>Tournament Overview</h3>
            <p>Welcome back. All systems are operational for Leo Football Cup 2026.</p>
          </div>
        );
      case 'matches':
        return <div className={s.card}><h2>Match Schedule Manager</h2><p>Coming Soon...</p></div>;
      case 'players':
        return <div className={s.card}><h2>Player Registration Database</h2><p>Coming Soon...</p></div>;
      case 'roles':
        return <RoleManagement session={session} />;
      default:
        return <div className={s.card}>Select a view from the sidebar.</div>;
    }
  };

  if (loading) return <div className={s.loader}>Loading...</div>;

  return (
    <div className={s.layout}>
      {/* Mobile Toggle */}
      <div className={s.mobileHeader}>
        <img src={leoLogo} alt="Leo Cup" className={s.mobileLogo} />
        <button className={s.menuBtn} onClick={() => setIsSidebarOpen(true)}>
          <FontAwesomeIcon icon={Icons.faBars} />
        </button>
      </div>

      <aside className={`${s.sidebar} ${isSidebarOpen ? s.sidebarOpen : ''}`}>
        <div className={s.sidebarInner}>
          <div className={s.topSection}>
            <div className={s.brand}>
              <img src={leoLogo} alt="Leo Cup" className={s.logoImg} />
              <div className={s.brandText}>LEO<span>CUP</span></div>
              <button className={s.closeBtn} onClick={() => setIsSidebarOpen(false)}>
                <FontAwesomeIcon icon={Icons.faXmark} />
              </button>
            </div>

            <nav className={s.nav}>
              {navItems.map((item) => (
                <button 
                  key={item.view_key}
                  className={view === item.view_key ? s.active : s.link} 
                  onClick={() => { setView(item.view_key); setIsSidebarOpen(false); }}
                >
                  <FontAwesomeIcon icon={Icons[item.icon_name] || Icons.faCircle} className={s.icon} /> 
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className={s.sidebarFooter}>
            <div className={s.adminCard}>
              <div className={s.avatar}>{session?.user?.email?.charAt(0).toUpperCase()}</div>
              <div className={s.adminInfo}>
                <p className={s.uName}>{userRole.toUpperCase()}</p>
                <p className={s.uEmail}>{session?.user?.email}</p>
              </div>
            </div>
            <button className={s.logout} onClick={() => supabase.auth.signOut()}>
              <FontAwesomeIcon icon={Icons.faSignOutAlt} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className={s.main}>
        <div className={s.container}>
          <header className={s.contentHeader}>
            <h1 className={s.viewTitle}>
              {navItems.find(n => n.view_key === view)?.label || 'Dashboard'}
            </h1>
          </header>
          
          <div className={s.contentBody}>
            {renderContent()}
          </div>
        </div>
      </main>

      {isSidebarOpen && <div className={s.overlay} onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default Dashboard;