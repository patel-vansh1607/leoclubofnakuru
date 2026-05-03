import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';

import RoleManagement from '../RoleManagement/RoleManagement';
import TeamApprovals from '../TeamApprovals/TeamApprovals'; 
import s from './Dashboard.module.css';

const Dashboard = () => {
  const { session } = useOutletContext();
  const [view, setView] = useState('overview');
  const [userRole, setUserRole] = useState('scorer');
  const [tournamentDropdown, setTournamentDropdown] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const leoLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572486/7932664-03_scur6z.png";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTournamentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserLevel = async () => {
      if (!session?.user?.id) return;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile) setUserRole(profile.role);
    };
    fetchUserLevel();
  }, [session]);

  return (
    <div className={s.dashboardContainer}>
      {/* Mobile Toggle - Hidden on Laptop */}
      <button className={s.mobileMenuBtn} onClick={() => setSidebarOpen(!isSidebarOpen)}>
        <FontAwesomeIcon icon={isSidebarOpen ? Icons.faTimes : Icons.faBars} />
      </button>

      <aside className={`${s.sidebar} ${isSidebarOpen ? s.sidebarActive : ''}`}>
        <div className={s.brand}>
          <img src={leoLogo} alt="Leo Logo" />
          <h2 className={s.brandText}>LEO<span>CUP</span></h2>
        </div>

        <nav className={s.nav}>
          <button 
            className={view === 'overview' ? s.activeBtn : s.navBtn} 
            onClick={() => {setView('overview'); setSidebarOpen(false);}}
          >
            <FontAwesomeIcon icon={Icons.faColumns} /> Overview
          </button>
          
          <div className={s.navGroup} ref={dropdownRef}>
            <button 
              className={tournamentDropdown || ['submissions', 'approvals', 'teams'].includes(view) ? s.activeBtn : s.navBtn} 
              onClick={() => setTournamentDropdown(!tournamentDropdown)}
            >
              <FontAwesomeIcon icon={Icons.faTrophy} /> Tournament 
              <FontAwesomeIcon icon={Icons.faChevronDown} className={`${s.chevron} ${tournamentDropdown ? s.rotate : ''}`} />
            </button>
            
            <div className={`${s.dropdownMenu} ${tournamentDropdown ? s.show : ''}`}>
              {['superadmin', 'master_admin'].includes(userRole) && (
                <>
                  <button className={view === 'submissions' ? s.innerActive : ''} onClick={() => {setView('submissions'); setSidebarOpen(false);}}>Submissions</button>
                  <button className={view === 'approvals' ? s.innerActive : ''} onClick={() => {setView('approvals'); setSidebarOpen(false);}}>Approvals</button>
                </>
              )}
              <button className={view === 'teams' ? s.innerActive : ''} onClick={() => {setView('teams'); setSidebarOpen(false);}}>Teams List</button>
            </div>
          </div>

          {userRole === 'master_admin' && (
            <button 
              className={view === 'roles' ? s.activeBtn : s.navBtn} 
              onClick={() => {setView('roles'); setSidebarOpen(false);}}
            >
              <FontAwesomeIcon icon={Icons.faUserShield} /> Role Access
            </button>
          )}
        </nav>

        <button className={s.logoutBtn} onClick={() => supabase.auth.signOut()}>
          <FontAwesomeIcon icon={Icons.faSignOutAlt} /> Logout
        </button>
      </aside>

      <main className={s.mainContent}>
        <header className={s.topBar}>
          <h1 className={s.viewTitle}>{view.toUpperCase()}</h1>
          <div className={s.userBadge}>{session?.user?.email}</div>
        </header>
        
        <div className={s.scrollArea}>
          {view === 'roles' && <RoleManagement session={session} />}
          {view === 'approvals' && <TeamApprovals session={session} />}
          {view === 'submissions' && <TeamApprovals session={session} filter="pending" />}
          {view === 'overview' && (
            <div className={s.bentoGrid}>
              <div className={`${s.bentoItem} ${s.welcomeCard}`}>
                <span className={s.locationTag}>NAKURU, KENYA</span>
                <h2 className={s.mainTitle}>Welcome, <span>Master</span></h2>
                <div className={s.cardDivider}></div>
                <p>Registration for Season 2 is active. You have full system clearance.</p>
              </div>
              {/* Add more bento items as needed */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;