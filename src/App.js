import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Registration from './Registration/Registration';
import Login from './Login/Login'; 
import Dashboard from './Dashboard/Dashboard'; 
import styles from './App.module.css';

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const leoLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572486/7932664-03_scur6z.png";
  const lionsLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572552/79326644-03_bknyzb.png";

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className={styles.appContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.navLeft}>
            <img src={leoLogo} className={styles.navLogo} alt="Leo" />
            <span className={styles.desktopClubName}>LEO CLUB OF NAKURU</span>
          </div>
          
          <button className={styles.hamburger} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className={`${styles.bar} ${isMenuOpen ? styles.activeBar1 : ''}`}></span>
            <span className={`${styles.bar} ${isMenuOpen ? styles.activeBar2 : ''}`}></span>
            <span className={`${styles.bar} ${isMenuOpen ? styles.activeBar3 : ''}`}></span>
          </button>

          <div className={`${styles.links} ${isMenuOpen ? styles.linksOpen : ''}`}>
            {/* Close Button inside the Mobile Menu */}
            <button className={styles.closeBtn} onClick={closeMenu}>&times;</button>
            
            <Link to="/" className={styles.link} onClick={closeMenu}>HOME</Link>
            <Link to="/registration" className={styles.link} onClick={closeMenu}>REGISTER</Link>
            <Link to="/about" className={styles.link} onClick={closeMenu}>ABOUT</Link>
            <Link to="/contact" className={styles.link} onClick={closeMenu}>CONTACT</Link>
            <Link to="/admin" className={`${styles.link} ${styles.adminBtn}`} onClick={closeMenu}>ADMIN</Link>
          </div>

          <div className={styles.navRight}>
            <span className={styles.desktopClubName}>LIONS CLUB OF NAKURU</span>
            <img src={lionsLogo} className={styles.navLogo} alt="Lions" />
          </div>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={
            <div className={styles.homeWrapper}>
               <header className={styles.heroHeader}>
                  <h1 className={styles.mainTitle}>LEO FOOTBALL <br/> CUP 2026</h1>
                  <p className={styles.locationTag}>LIONS PRIMARY GROUND • JUNE 20-21</p>
                </header>
                <section className={styles.missionSection}>
                  <div className={styles.missionCard}>
                    <h2 className={styles.cardTitle}>Why We Play</h2>
                    <div className={styles.cardDivider}></div>
                    <p className={styles.cardText}>
                      The Leo Football Cup Season 2 is a platform designed to empower local youth through sportsmanship and discipline.
                    </p>
                    <Link to="/registration" className={styles.primaryCta}>JOIN THE TOURNAMENT</Link>
                  </div>
                </section>
            </div>
          } />
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