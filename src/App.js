import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navbar from './Navbar/Navbar';
import Registration from './Registration/Registration';
import Login from './Login/Login'; 
import Dashboard from './Dashboard/Dashboard'; 
import styles from './App.module.css';

function AppContent() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false); 
  const location = useLocation();

  // --- SUBDOMAIN DETECTION ---
  // This checks if the user is visiting via your Namecheap subdomain
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isSubdomain = hostname.startsWith('app.'); 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkUserStatus(session);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const checkUserStatus = async (currentSession) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentSession.user.id)
        .single();

      if (data?.role === 'restricted') {
        await supabase.auth.signOut();
        setIsBlocked(true);
        setSession(null);
      } else {
        setSession(currentSession);
        setIsBlocked(false);
      }
    } catch (err) {
      setSession(currentSession);
    } finally {
      setLoading(false);
    }
  };

  // Logic to hide navbar for specific paths OR if on the registration subdomain
  const hideNavbar = 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/admin') || 
    isSubdomain; // Hide navbar if we are on app.yourdomain.com

  if (loading) return <div className={styles.loader}>Verifying...</div>;

  if (isBlocked) {
    return (
      <div className={styles.blockedOverlay}>
        <div className={styles.blockedCard}>
          <h1>Access Restricted</h1>
          <p>Please contact Vansh for an upgrade.</p>
          <button onClick={() => setIsBlocked(false)}>Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? styles.dashboardWrapper : styles.mainContent}>
        <Routes>
          {/* 
              If user is on the subdomain, the "/" path shows Registration.
              Otherwise, it shows the Leo Cup Home.
          */}
          <Route 
            path="/" 
            element={isSubdomain ? <Registration /> : <div className={styles.home}><h1>Leo Cup Home</h1></div>} 
          />
          
          <Route path="/registration" element={<Registration />} />
          <Route path="/admin" element={session ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/admin" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;