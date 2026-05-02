import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import styles from './TeamGallery.module.css';

const TeamGallery = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch teams and include their related players
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          players (*)
        `)
        .order('created_at', { ascending: false });

      if (error) console.error("Error fetching rosters:", error);
      else setTeams(data);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  const renderSquads = (genderType) => {
    const filteredTeams = teams.filter(team => team.gender === genderType);

    return (
      <div className={styles.categorySection}>
        <h2 className={styles.categoryTitle}>{genderType} DIVISION</h2>
        <div className={styles.teamsGrid}>
          {filteredTeams.map((team) => (
            <div key={team.id} className={styles.teamWrapper}>
              <div className={styles.teamHeader}>
                <h3 className={styles.sakanaTeamName}>{team.team_name}</h3>
                <span className={styles.squadId}>ID: {team.team_id}</span>
              </div>
              
              <div className={styles.playerList}>
                {team.players.map((player) => (
                  <div key={player.id} className={styles.playerRow}>
                    <div className={styles.playerInfo}>
                      <span className={styles.playerNum}>[{player.player_id.split('-').pop()}]</span>
                      <span className={styles.playerName}>{player.name}</span>
                    </div>
                    {/* Unique QR for every player in the squad */}
                    <div className={styles.miniQr}>
                      <QRCodeCanvas 
                        value={player.qr_string} 
                        size={40} 
                        bgColor="#3d041a" 
                        fgColor="#f1c40f" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className={styles.loader}>INITIALIZING ROSTERS...</div>;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.scanlineOverlay}></div>
        
        <header className={styles.header}>
          <h1 className={styles.sakanaTitle}>LEO CUP <span>S2 ROSTERS</span></h1>
          <p className={styles.tag}>OFFICIAL REGISTERED SQUADS</p>
        </header>

        {renderSquads('BOYS')}
        <div className={styles.divider}></div>
        {renderSquads('GIRLS')}
      </div>
    </>
  );
};

export default TeamGallery;