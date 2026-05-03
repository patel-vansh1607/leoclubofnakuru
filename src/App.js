import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navbar from './Navbar/Navbar';
import Registration from './Registration/Registration';
import styles from './App.module.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const location = useLocation();
  const hostname = window.location.hostname;

  // Domain Check: Handle specialized registration subdomain
  const isRegisterSubdomain = hostname === 'register.leofootball.online' || hostname === 'register.localhost';

  useEffect(() => {
    const getInitialSession = async () => {
      console.log("DEBUG: Checking initial auth session...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await checkUserStatus(session);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("DEBUG: Auth state changed:", _event);
      if (session) {
        checkUserStatus(session);
      } else {
        setSession(null);
        setIsBlocked(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Verified user roles against the database.
   * If a user is 'restricted', they are booted immediately.
   */
  const checkUserStatus = async (currentSession) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentSession.user.id)
        .single();

      if (data?.role === 'restricted') {
        console.warn("DEBUG: Restricted user detected. Blocking access.");
        await supabase.auth.signOut();
        setIsBlocked(true);
        setSession(null);
      } else {
        setSession(currentSession);
        setIsBlocked(false);
      }
    } catch (err) {
      console.error("DEBUG: Role check failed, defaulting to session active.", err);
      setSession(currentSession);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERING LOGIC ---

  if (loading) return <div className={styles.loader}>Verifying Security Levels...</div>;

  // 1. Handle Registration Subdomain
  if (isRegisterSubdomain) return <Registration />;

  // 2. Handle Blocked/Restricted Users
  if (isBlocked) {
    return (
      <div className={styles.blockedOverlay}>
        <div className={styles.blockedCard}>
          <h1>Access Restricted</h1>
          <p>Your account level does not permit dashboard access.</p>
          <p>Please contact <strong>Vansh</strong> for an upgrade.</p>
          <button onClick={() => setIsBlocked(false)}>Return Home</button>
        </div>
      </div>
    );
  }

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');
  const hideNavbar = isDashboard || isAdmin;

  // 3. Auth Guard: Redirect unauthenticated users trying to hit the dashboard
  if (isDashboard && !session) return <Navigate to="/admin" replace />;
  if (isAdmin && session) return <Navigate to="/dashboard" replace />;

  return (
    <div className={styles.appContainer}>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? styles.dashboardWrapper : styles.mainContent}>
        {/* 
            CRITICAL: The 'context' prop allows all child routes 
            (like Dashboard) to access the session.
        */}
        <Outlet context={{ session }} />
      </main>
    </div>
  );
}

export default App;