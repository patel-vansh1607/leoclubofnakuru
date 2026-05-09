import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import s from './Dashboard.module.css';

const MySwal = withReactContent(Swal);

const Dashboard = () => {
  const { session } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('scorer');
  const [tournamentDropdown, setTournamentDropdown] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0); 
  
  const leoLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572486/7932664-03_scur6z.png";

  useEffect(() => {
    const fetchUserLevel = async () => {
      if (!session?.user?.id) return;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile) setUserRole(profile.role);
    };

    const fetchMessageCount = async () => {
      const { count, error } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');
      if (!error) setUnreadMessages(count || 0);
    };

    fetchUserLevel();
    fetchMessageCount(); 
  }, [session]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    const result = await MySwal.fire({
      title: 'Logout?',
      text: "Are you sure you want to end your session?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout',
      background: '#4c0a23',
      color: '#fff',
      customClass: { popup: s.swalPopup }
    });

    if (result.isConfirmed) {
      try {
        await supabase.auth.signOut();
        navigate('/');
      } catch (error) {
        console.error("Logout error", error);
      }
    }
  };

  const getViewTitle = () => {
    const path = location.pathname;
    if (path.includes('submissions')) return 'Submissions';
    if (path.includes('approvals')) return 'Approvals';
    if (path.includes('teams')) return 'Teams List';
    if (path.includes('roles')) return 'Role Access';
    if (path.includes('add-team')) return 'Add New Team';
    if (path.includes('playing-teams')) return 'Tournament Roster';
    if (path.includes('draft-teams')) return 'Draft Teams';
    if (path.includes('verify-player')) return 'Field Verification';
    if (path.includes('scoring')) return 'Match Scoring';
    if (path.includes('groups')) return 'Group Management'; 
    if (path.includes('messages')) return 'Contact Inquiries'; 
    return 'Overview';
  };

  return (
    <div className={s.dashboardContainer}>
      <button className={s.mobileMenuBtn} onClick={() => setSidebarOpen(!isSidebarOpen)}>
        <FontAwesomeIcon icon={isSidebarOpen ? Icons.faTimes : Icons.faBars} />
      </button>

      {isSidebarOpen && <div className={s.overlay} onClick={() => setSidebarOpen(false)} />}

      <aside className={`${s.sidebar} ${isSidebarOpen ? s.sidebarActive : ''}`}>
        <div className={s.brand}>
          <img src={leoLogo} alt="Logo" className={s.logoImg} />
          <div className={s.brandInfo}>
            <h2 className={s.brandText}>LEO<span>CUP</span></h2>
            <span className={s.brandSub}>ADMIN PANEL</span>
          </div>
        </div>

        <div className={s.navScrollContainer}>
          <nav className={s.nav}>
            <p className={s.sectionLabel}>MENU</p>


            <button className={isActive('/dashboard/messages') ? s.activeBtn : s.navBtn} onClick={() => { navigate('/dashboard/messages'); setSidebarOpen(false); }}>
              <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faEnvelopeOpenText} /></div>
              <span>Messages</span>
              {unreadMessages > 0 && <span className={s.msgBadge}>{unreadMessages}</span>}
            </button>
            
            <div className={s.navGroup}>
              <button 
                className={tournamentDropdown || location.pathname.includes('submissions') || location.pathname.includes('approvals') || location.pathname.includes('teams') ? s.activeBtn : s.navBtn} 
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

            {/* FIELD TOOLS */}
            {(userRole === 'master_admin' || userRole === 'super_admin' || userRole === 'scorer') && (
              <>
                <p className={s.sectionLabel}>FIELD TOOLS</p>
                <button className={isActive('/dashboard/verify-player') ? s.activeBtn : s.navBtn} onClick={() => { navigate('/dashboard/verify-player'); setSidebarOpen(false); }}>
                  <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faQrcode} /></div>
                  <span>Verify Player</span>
                </button>

                {(userRole === 'master_admin' || userRole === 'scorer') && (
                  <button className={isActive('/dashboard/scoring') ? s.activeBtn : s.navBtn} onClick={() => { navigate('/dashboard/scoring'); setSidebarOpen(false); }}>
                    <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faFutbol} /></div>
                    <span>Match Scoring</span>
                  </button>
                )}
              </>
            )}

            {/* MANAGEMENT */}
            {(userRole === 'master_admin' || userRole === 'super_admin') && (
              <>
                <p className={s.sectionLabel}>MANAGEMENT</p>
                <button className={isActive('/dashboard/add-team') ? s.activeBtn : s.navBtn} onClick={() => { navigate('/dashboard/add-team'); setSidebarOpen(false); }}>
                  <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faPlusCircle} /></div>
                  <span>Add Team</span>
                </button>
                <button className={isActive('/dashboard/playing-teams') ? s.activeBtn : s.navBtn} onClick={() => { navigate('/dashboard/playing-teams'); setSidebarOpen(false); }}>
                  <div className={s.iconBox}><FontAwesomeIcon icon={Icons.faUsers} /></div>
                  <span>Playing Teams</span>
                </button>
              </>
            )}

            {/* SYSTEM - ONLY VISIBLE TO MASTER ADMIN */}
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
              <span className={s.userName}>{session?.user?.email.split('@')[0]}</span>
              <div className={s.roleBadgeWrapper}>
                <div className={s.roleDot} />
                <span className={s.roleBadge}>{userRole.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          <button className={s.logoutBtn} onClick={handleLogout}>
            <FontAwesomeIcon icon={Icons.faSignOutAlt} />
            <span>End Session</span>
          </button>
        </div>
      </aside>

      <main className={s.mainContent}>
        <div className={s.mobileHeader}>
          <img src={leoLogo} alt="Logo" className={s.mobileLogo} />
          <h2 className={s.mobileBrandText}>LEO<span>CUP</span></h2>
        </div>
        <div className={s.topBar}><h1 className={s.viewTitle}>{getViewTitle()}</h1></div>
        <div className={s.scrollArea}>
          <div className={s.contentWrapper}><Outlet context={{ session, userRole }} /></div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;