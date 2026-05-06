import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, faMapMarkedAlt, faQrcode, faArrowRight, 
  faCalendarAlt, faBolt, faShieldAlt, faMobileAlt
} from '@fortawesome/free-solid-svg-icons';
import s from './Home.module.css';
import Footer from '../Footer/Footer';

const Home = () => {
  return (
    <div className={s.container}>
      {/* --- 🔥 HERO SECTION --- */}
      <header className={s.hero}>
        <div className={s.stadiumGlow}></div>
        <div className={s.heroContent}>
          <div className={s.badge}>SEASON 2 • NAKURU, KENYA</div>
          <h1 className={s.sakanaTitle}>LEO FOOTBALL CUP <span>SEASON 2</span></h1>
          <p className={s.heroSubtitle}>Where Talent Meets Opportunity</p>
          <div className={s.heroActions}>
<a href="https://register.leofootball.online" className={s.btnLink}>
              <button className={s.primaryBtn}>
                Register Team <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </a>            {/* <button className={s.secondaryBtn}>View Fixtures</button> */}
          </div>
        </div>
      </header>

      {/* --- 📌 EVENT HIGHLIGHTS STRIP --- */}
      <section className={s.highlightsStrip}>
        <div className={s.highlightItem}>
          <FontAwesomeIcon icon={faCalendarAlt} className={s.goldIcon} />
          <div><span>DATES</span><p>27th – 28th June 2026</p></div>
        </div>
        <div className={s.highlightItem}>
          <FontAwesomeIcon icon={faTrophy} className={s.goldIcon} />
          <div><span>PRIZE</span><p>Big Wins</p></div>
        </div>
        <div className={s.highlightItem}>
          <FontAwesomeIcon icon={faQrcode} className={s.goldIcon} />
          <div><span>ENTRY</span><p>QR Code Verification</p></div>
        </div>
        <div className={s.highlightItem}>
          <FontAwesomeIcon icon={faMapMarkedAlt} className={s.goldIcon} />
          <div><span>VENUE</span><p>Lions Primary Ground</p></div>
        </div>
      </section>

      {/* --- 📝 REGISTRATION SECTION --- */}
      <section className={s.sectionWrapper}>
        <div className={s.registrationCard}>
          <div className={s.regText}>
            <h2>REGISTER YOUR <span className={s.gold}>TEAM</span></h2>
            <p>Scan the official QR or click the link below to access the registration portal.</p>
            {/* Improved Link Color & Styling */}
            <a href="https://register.leofootball.online" target="_blank" rel="noreferrer" className={s.regLink}>
              register.leofootball.online
            </a>
          </div>
          <div className={s.qrContainer}>
            <div className={s.qrPlaceholder}>
               {/* Live QR Image from Cloudinary */}
               <img 
                 src="https://res.cloudinary.com/dxgkcyfrl/image/upload/v1778086855/LeoCup_QR_1778059138771_hvhph4.svg" 
                 alt="Leo Cup Registration QR" 
                 className={s.qrImage}
               />
            </div>
            <span className={s.qrLabel}>Official Registration QR</span>
          </div>
        </div>
      </section>

      {/* --- 🚀 WHAT'S NEW & UPDATES --- */}
<section className={s.sectionWrapper}>
  <h2 className={s.sectionTitle}>WHAT'S <span className={s.gold}>NEW</span></h2>
  <div className={s.newUpdatesGrid}>
    
    {/* Update 1: Girls Pool Expansion */}
    <div className={s.updateCard}>
      <div className={s.iconCircle}><FontAwesomeIcon icon={faBolt} /></div>
      <h3>Inaugural Girls Pool</h3>
      <p>Expanding the tournament to include a dedicated women's division, fostering inclusivity and showcasing diverse football talent.</p>
    </div>

    {/* Update 2: Player Analytics/ID */}
    <div className={s.updateCard}>
      <div className={s.iconCircle}><FontAwesomeIcon icon={faShieldAlt} /></div>
      <h3>Unified Player Analytics</h3>
      <p>Advanced Digital ID integration providing every athlete with unique QR-coded tracking for performance metrics and career stats.</p>
    </div>

    {/* Update 3: Live Scoring Portal */}
    <div className={s.updateCard}>
      <div className={s.iconCircle}><FontAwesomeIcon icon={faMobileAlt} /></div>
      <h3>Real-Time Digital Hub</h3>
      <p>Instant access to match results, live scoring, and league standings through our proprietary cloud-based tournament portal.</p>
    </div>

  </div>
</section>    
<Footer />
</div>
  );
};

export default Home;