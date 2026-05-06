import React, { useState } from 'react';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auto-detect if we are on localhost
  const isLocal = window.location.hostname === "localhost";

  // Configuration for navigation
  const MAIN_URL = isLocal ? "http://localhost:3000" : "https://leofootball.online";

  const leoLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572486/7932664-03_scur6z.png";
  const lionsLogo = "https://res.cloudinary.com/dxgkcyfrl/image/upload/v1777572552/79326644-03_bknyzb.png";

  const closeMenu = () => setIsMenuOpen(false);

  return (
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
          <button className={styles.closeBtn} onClick={closeMenu}>&times;</button>
          
          <a href={`${MAIN_URL}/`} className={styles.link} onClick={closeMenu}>HOME</a>
          <a href={`${MAIN_URL}/contact`} className={styles.link} onClick={closeMenu}>CONTACT</a>
          
          {/* Admin link - access remains restricted to Vansh's authorization */}
          <a href={`${MAIN_URL}/admin`} className={`${styles.link} ${styles.adminBtn}`} onClick={closeMenu}>ADMIN</a>
        </div>

        <div className={styles.navRight}>
          <span className={styles.desktopClubName}>LIONS CLUB OF NAKURU</span>
          <img src={lionsLogo} className={styles.navLogo} alt="Lions" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;