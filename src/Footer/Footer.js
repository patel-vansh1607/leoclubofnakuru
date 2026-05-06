import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import s from './Footer.module.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={s.footer}>
      <div className={s.footerContent}>
        {/* Left: Branding */}
        <div className={s.footerSection}>
          <div className={s.footerLogo}>
            <h3>LEO football CUP <span>Season 2</span></h3>
            <p>Where Talent Meets Opportunity</p>
          </div>
        </div>

        {/* Center: Contacts */}
        <div className={s.footerSection}>
          <h4 className={s.sectionLabel}>GET IN TOUCH</h4>
          <div className={s.socialLinks}>
            <a href="https://instagram.com/nakuruleoclub" target="_blank" rel="noreferrer" className={s.socialIcon}>
              <FontAwesomeIcon icon={faInstagram} />
              <span>@nakuruleoclub</span>
            </a>
            <a href="mailto:info@leofootball.online" className={s.socialIcon}>
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Contact Support</span>
            </a>
          </div>
        </div>

        {/* Right: Scroll to Top */}
        <div className={`${s.footerSection} ${s.alignRight}`}>
          <button 
            className={s.scrollTop} 
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <FontAwesomeIcon icon={faChevronUp} />
          </button>
        </div>
      </div>
      
      <div className={s.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Leo Football Cup. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;