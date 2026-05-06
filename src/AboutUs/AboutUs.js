import React from 'react';
import s from './AboutUs.module.css';

const About = () => {
  return (
    <div className={s.container}>
      {/* GLOBAL IDENTITY SECTION */}
      <section className={s.globalMission}>
        <h6>LEADERSHIP | EXPERIENCE | OPPORTUNITY</h6>
        <h2>A Global Movement, A Local Legacy</h2>
        <p>
          As part of the global Leo Club community, we provide young people with the 
          opportunity to serve their communities and develop as leaders. The Leo Football 
          Cup 2026 is our way of creating a professional stage for the stars of tomorrow.
        </p>
      </section>

      {/* THE STORY OF OUR BOARD */}
      <section className={s.boardProgress}>
        <h2 className={s.sectionTitle}>The Leo Board & Progress</h2>
        <div className={s.progressGrid}>
          <div className={s.progressText}>
            <h3>What We Have Done</h3>
            <ul>
              <li>
                <strong>Community Infrastructure:</strong> Built a live database and attendance 
                system for Nakuru-based organizations to ensure transparency and scale.
              </li>
              <li>
                <strong>Event Management:</strong> Successfully executed a three-day community 
                inauguration in January 2026, reaching thousands through live streaming.
              </li>
              <li>
                <strong>Youth Engagement:</strong> Currently organizing the 2026 Football 
                Tournament, providing a platform for 16+ local teams to compete.
              </li>
            </ul>
          </div>
          <div className={s.boardInfo}>
            <h3>Board Oversight</h3>
            <p>Our progress is guided by <strong>Chairman Shailesh</strong> and <strong>Supervisor Ken Korir</strong>, ensuring every project meets professional standards.</p>
          </div>
        </div>
      </section>

      {/* CINEMATIC STORYTELLING SECTION */}
      <section className={s.cinematography}>
        <div className={s.bentoGrid}>
          <div className={`${s.bentoItem} ${s.large}`}>
            <h3>Cinematic Storytelling</h3>
            <p>
              We don't just "record"—we produce. Using a professional cinema workflow 
              (Sony FX30, NX, and a7 IV), we capture the raw emotion of the pitch. 
              Our goal is to give every player a "Self-Portrait" film that tells 
              their unique journey.
            </p>
          </div>
          <div className={s.bentoItem}>
            <h3>4K Resolution</h3>
            <p>Every goal is captured in high-fidelity for global scouting opportunities.</p>
          </div>
          <div className={s.bentoItem}>
            <h3>Digital First</h3>
            <p>QR-integrated player profiles powered by a custom-built tech stack.</p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className={s.legacy}>
        <h2>"The team is me—I'm doing it myself to ensure the highest standard."</h2>
        <p>Building the future of Nakuru sports, one frame at a time.</p>
      </section>
    </div>
  );
};

export default About;