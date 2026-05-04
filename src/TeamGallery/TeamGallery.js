import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import s from './TeamGallery.module.css';

const TeamGallery = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BOYS');

  useEffect(() => {
    const fetchAllData = async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`*, players (*)`)
        .order('created_at', { ascending: false });

      if (error) console.error("Error fetching rosters:", error);
      else setTeams(data);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const filteredTeams = teams.filter(team => team.gender === activeTab);

  if (loading) return (
    <div className={s.loaderContainer}>
      <div className={s.spinner}></div>
      <p>Loading tournament rosters...</p>
    </div>
  );

  return (
    <div className={s.galleryContainer}>
      {/* Dashboard Sub-Header */}
      <div className={s.pageHeader}>
        <div className={s.headerText}>
          <h2 className={s.title}>Registered Squads</h2>
          <p className={s.subtitle}>Overview of all teams and player credentials for Season 2</p>
        </div>
        
        <div className={s.tabSwitcher}>
          <button 
            className={activeTab === 'BOYS' ? s.tabActive : s.tabBtn} 
            onClick={() => setActiveTab('BOYS')}
          >
            Boys Division
          </button>
          <button 
            className={activeTab === 'GIRLS' ? s.tabActive : s.tabBtn} 
            onClick={() => setActiveTab('GIRLS')}
          >
            Girls Division
          </button>
        </div>
      </div>

      <div className={s.statsBar}>
        <div className={s.statItem}>
          <span className={s.statValue}>{filteredTeams.length}</span>
          <span className={s.statLabel}>Total Teams</span>
        </div>
        <div className={s.statItem}>
          <span className={s.statValue}>
            {filteredTeams.reduce((acc, team) => acc + (team.players?.length || 0), 0)}
          </span>
          <span className={s.statLabel}>Total Players</span>
        </div>
      </div>

      <div className={s.teamsGrid}>
        {filteredTeams.map((team) => (
          <div key={team.id} className={s.teamCard}>
            <div className={s.teamCardHeader}>
              <div className={s.teamInfo}>
                <h3 className={s.teamName}>{team.team_name}</h3>
                <span className={s.teamId}>ID: {team.team_id}</span>
              </div>
              <div className={s.teamBadge}>
                <FontAwesomeIcon icon={Icons.faUsers} /> {team.players?.length}
              </div>
            </div>

            <div className={s.playerTable}>
              <div className={s.tableHeader}>
                <span>PLAYER NAME</span>
                <span>ID & QR</span>
              </div>
              {team.players.map((player) => (
                <div key={player.id} className={s.playerRow}>
                  <div className={s.playerMain}>
                    <span className={s.playerNumber}>{player.player_id.split('-').pop()}</span>
                    <span className={s.playerName}>{player.name}</span>
                  </div>
                  
                  <div className={s.playerAction}>
                    <div className={s.qrWrapper}>
                      <QRCodeCanvas 
                        value={player.qr_string} 
                        size={32} 
                        bgColor="transparent" 
                        fgColor="#f1c40f" 
                        level="L"
                      />
                    </div>
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

export default TeamGallery;