import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import s from './Dashboard.module.css';

const Dashboard = () => {
  const { session } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('scorer');
  const [tournamentDropdown, setTournamentDropdown] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const leoLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572486/7932664-03_scur6z.png";

  useEffect(() => {
    const fetchUserLevel = async () => {
      if (!session?.user?.id) return;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile) setUserRole(profile.role);
    };
    fetchUserLevel();
  }, [session]);

  const isActive = (path) => location.pathname === path;

  const getViewTitle = () => {
    const path = location.pathname;
    if (path.includes('submissions')) return 'Submissions';
    if (path.includes('approvals')) return 'Approvals';
    if (path.includes('teams')) return 'Teams List';
    if (path.includes('roles')) return 'Role Access';
    if (path.includes('add-team')) return 'Add New Team';
    if (path.includes('playing-teams')) return 'Tournament Roster'; // Added Title
    if (path.includes('draft-teams')) return 'Draft Teams';
    return 'Overview';
  };

  return (
    <div className={s.dashboardContainer}>
      {/* Mobile Toggle */}
      <button className={s.mobileMenuBtn} onClick={() => setSidebarOpen(!isSidebarOpen)}>
        <FontAwesomeIcon icon={isSidebarOpen ? Icons.faTimes : Icons.faBars} />
      </button>

      {isSidebarOpen && <div className={s.overlay} onClick={() => setSidebarOpen(false)} />}

      <aside className={`${s.sidebar} ${isSidebarOpen ? s.sidebarActive : ''}`}>
        <div className={s.brand}>
          <img src={leoLogo} alt="Logo" className={s.logoImg} />
          <h2 className={s.brandText}>LEO<span>CUP</span></h2>
          <span className={s.brandSub}>ADMIN PANEL</span>
        </div>

        <div className={s.navScrollContainer}>
          <nav className={s.nav}>
            <p className={s.sectionLabel}>MENU</p>
            <button className={isActive('/dashboard') ? s.activeBtn : s.navBtn} onClick={() => { navigate('/dashboard'); setSidebarOpen(false); }}>
              <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faColumns} /></div>
              <span>Overview</span>
            </button>
            
            <div className={s.navGroup}>
              <button 
                className={tournamentDropdown || location.pathname.includes('tournament') ? s.activeBtn : s.navBtn} 
                onClick={() => setTournamentDropdown(!tournamentDropdown)}
              >
                <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faTrophy} /></div>
                <span>Tournament</span>
                <FontAwesomeIcon icon={Icons.faChevronDown} className={`${s.chevron} ${tournamentDropdown ? s.rotate : ''}`} />
              </button>
              
              <div className={`${s.dropdownMenu} ${tournamentDropdown ? s.show : ''}`}>
                <div className={s.dropLine} />
                <div className={s.dropItems}>
                  <button className={isActive('/dashboard/submissions') ? s.innerActive : s.innerBtn} onClick={() => { navigate('/dashboard/submissions'); setSidebarOpen(false); }}>Submissions</button>
                  <button className={isActive('/dashboard/approvals') ? s.innerActive : s.innerBtn} onClick={() => { navigate('/dashboard/approvals'); setSidebarOpen(false); }}>Approvals</button>
                  <button className={isActive('/dashboard/teams') ? s.innerActive : s.innerBtn} onClick={() => { navigate('/dashboard/teams'); setSidebarOpen(false); }}>Teams List</button>
                </div>
              </div>
            </div>

            {/* Restricted Access for Master Admin & Super Admin */}
            {(userRole === 'master_admin' || userRole === 'super_admin') && (
              <>
                <p className={s.sectionLabel}>MANAGEMENT</p>
                <button className={isActive('/dashboard/add-team') ? s.activeBtn : s.navBtn} onClick={() => { navigate('/dashboard/add-team'); setSidebarOpen(false); }}>
                  <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faPlusCircle} /></div>
                  <span>Add Team</span>
                </button>
                {/* NEW: Playing Teams Oversight */}
                <button className={isActive('/dashboard/playing-teams') ? s.activeBtn : s.navBtn} onClick={() => { navigate('/dashboard/playing-teams'); setSidebarOpen(false); }}>
                  <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faUsers} /></div>
                  <span>Playing Teams</span>
                </button>
              </>
            )}

            {userRole === 'master_admin' && (
              <>
                <p className={s.sectionLabel}>SYSTEM</p>
                <button className={isActive('/dashboard/roles') ? s.activeBtn : s.navBtn} onClick={() => { navigate('/dashboard/roles'); setSidebarOpen(false); }}>
                  <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faUserShield} /></div>
                  <span>Role Access</span>
                </button>
                <button className={isActive('/dashboard/draft-teams') ? s.activeBtn : s.navBtn} onClick={() => { navigate('/dashboard/draft-teams'); setSidebarOpen(false); }}>
                  <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faClipboardList} /></div>
                  <span>Draft Teams</span>
                </button>
              </>
            )}
          </nav>
        </div>

        <div className={s.sidebarFooter}>
          <div className={s.userCard}>
            <div className={s.avatar}>{session?.user?.email?.charAt(0).toUpperCase()}</div>
            <div className={s.userMeta}>
              <span className={s.userEmail}>{session?.user?.email.split('@')[0]}</span>
              <span className={s.roleBadge}>{userRole.replace('_', ' ')}</span>
            </div>
          </div>
          <button className={s.logoutBtn} onClick={() => supabase.auth.signOut()}>
            <FontAwesomeIcon icon={Icons.faSignOutAlt} /> Logout
          </button>
        </div>
      </aside>

      <main className={s.mainContent}>
        <div className={s.mobileHeader}>
          <img src={leoLogo} alt="Logo" className={s.mobileLogo} />
          <h2 className={s.mobileBrandText}>LEO<span>CUP</span></h2>
        </div>

        <div className={s.topBar}>
          <h1 className={s.viewTitle}>{getViewTitle()}</h1>
        </div>
        
        <div className={s.scrollArea}>
          <div className={s.contentWrapper}>
            <Outlet context={{ session, userRole }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;