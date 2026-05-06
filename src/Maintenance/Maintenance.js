import React from 'react';
import s from './Maintenance.module.css';

const Maintenance = () => {
  return (
    <div className={s.pageWrapper}>
      <div className={s.contentCenter}>
        <div className={s.statusBadge}>
          <div className={s.pulse}></div>
          <span>MAINTENANCE ONGOING</span>
        </div>

        <h1 className={s.mainBrand}>
          LEO FOOTBALL CUP <span className={s.goldText}>2026</span>
        </h1>

        <p className={s.description}>
          Portal undergoing technical refinements for the June tournament season. 
          Access is temporarily restricted.
        </p>

        

        <footer className={s.footer}>
          Managed by Leo Club of Nakuru
        </footer>
      </div>
    </div>
  );
};

export default Maintenance;