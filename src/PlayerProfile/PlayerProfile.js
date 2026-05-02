import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import Navbar from '../Navbar/Navbar';
import styles from './PlayerProfile.module.css';

const PlayerProfile = () => {
  const { playerId } = useParams();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          teams (
            team_name,
            team_id,
            category,
            gender
          )
        `)
        .eq('player_id', playerId)
        .single();

      if (error) {
        console.error("DATA_FETCH_ERROR:", error);
      } else {
        setPlayerData(data);
      }
      setLoading(false);
    };

    fetchPlayerData();
  }, [playerId]);

  if (loading) return <div className={styles.statusScreen}>CONNECTING_TO_DATABASE...</div>;

  if (!playerData) return (
    <div className={styles.statusScreen}>
      <h1 className={styles.errorText}>[404_PLAYER_NOT_FOUND]</h1>
      <p>INVALID IDENTITY STRING</p>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.scanlineOverlay}></div>
        
        <div className={styles.idCard}>
          <header className={styles.cardHeader}>
            <div className={styles.logoSection}>
              <h2 className={styles.sakanaBrand}>LEO CUP <span>S2</span></h2>
              <span className={styles.verifiedBadge}>
                {playerData.verified ? "VERIFIED_ATHLETE" : "PENDING_AUDIT"}
              </span>
            </div>
            <div className={styles.metaData}>
              <span>DATE: 20.06.2026</span>
              <span>LOC: NAKURU_KE</span>
            </div>
          </header>

          <main className={styles.mainContent}>
            <div className={styles.profileInfo}>
              <label className={styles.label}>[LEGAL_NAME]</label>
              <h1 className={styles.playerName}>{playerData.name}</h1>

              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <label>SQUAD</label>
                  <p>{playerData.teams.team_name}</p>
                </div>
                <div className={styles.statBox}>
                  <label>DIVISION</label>
                  <p>{playerData.teams.gender} {playerData.teams.category}</p>
                </div>
                <div className={styles.statBox}>
                  <label>PLAYER_ID</label>
                  <p>{playerData.player_id}</p>
                </div>
              </div>
            </div>

            <div className={styles.qrSection}>
              <div className={styles.qrWrapper}>
                <QRCodeCanvas 
                  value={`https://leocup.com/profile/${playerData.player_id}`} 
                  size={180}
                  bgColor={"#f1c40f"}
                  fgColor={"#3d041a"}
                  level={"H"}
                />
              </div>
              <span className={styles.qrLabel}>AUTHENTIC_ID_STRING</span>
            </div>
          </main>

          <footer className={styles.cardFooter}>
            <p>LEO CLUB NAKURU OFFICIAL DOCUMENTATION - SEASON 2</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default PlayerProfile;