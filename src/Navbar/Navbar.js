import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  );
};

export default Navbar;