import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import s from './PlayingTeams.module.css';

const PlayingTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePool, setActivePool] = useState('BOYS');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegisteredData();
  }, []);

  const fetchRegisteredData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select(`*, players (*)`)
      .order('created_at', { ascending: false });

    if (error) console.error("Fetch Error:", error);
    else setTeams(data);
    setLoading(false);
  };

  const filteredTeams = teams.filter(team => 
    team.pool === activePool && 
    team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.metaRow}>
          <div className={s.adminBadge}>
            <FontAwesomeIcon icon={Icons.faShieldHalved} /> 
            <span>OVERSIGHT_v2.0</span>
          </div>
          <div className={s.statBadge}>
            <span className={s.statLabel}>TOTAL_ROSTERS:</span>
            <span className={s.statValue}>{teams.length}</span>
          </div>
        </div>

        <div className={s.mainHeader}>
          <div className={s.titleGroup}>
            <h1 className={s.title}>Registered <span className={s.gold}>Teams</span></h1>
            <p className={s.subtitle}>Management and verification of active tournament participants.</p>
          </div>

          <div className={s.controls}>
            <div className={s.searchWrapper}>
              <FontAwesomeIcon icon={Icons.faSearch} className={s.searchIcon} />
              <input 
                type="text" 
                placeholder="Find team..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={s.poolTabs}>
              <button 
                className={activePool === 'BOYS' ? s.activeTab : ''} 
                onClick={() => setActivePool('BOYS')}
              >BOYS</button>
              <button 
                className={activePool === 'GIRLS' ? s.activeTab : ''} 
                onClick={() => setActivePool('GIRLS')}
              >GIRLS</button>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className={s.loader}>
          <div className={s.spinner}></div>
          <p>SYNCING_DATABASE...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className={s.emptyState}>
          <FontAwesomeIcon icon={Icons.faFolderOpen} />
          <p>NO TEAMS DEPLOYED IN {activePool} POOL</p>
        </div>
      ) : (
        <div className={s.teamGrid}>
          {filteredTeams.map(team => {
            const captain = team.players?.length > 0 
              ? team.players.sort((a, b) => a.id - b.id)[0].name 
              : "UNASSIGNED";

            return (
              <div 
                key={team.id} 
                className={s.teamCard} 
                onClick={() => navigate(`/dashboard/playing-teams/${team.id}`)}
              >
                <div className={s.poolIndicator}>{team.pool}</div>
                <div className={s.cardMain}>
                  <div className={s.infoSide}>
                    <h2 className={s.teamName}>{team.team_name}</h2>
                    <div className={s.captainTag}>
                      <FontAwesomeIcon icon={Icons.faStar} />
                      <span>{captain}</span>
                    </div>
                  </div>
                  <div className={s.rosterCircle}>
                    <span className={s.rosterCount}>{team.players?.length || 0}</span>
                    <span className={s.rosterLabel}>PLR</span>
                  </div>
                </div>
                <div className={s.cardBottom}>
                  <span className={s.idHash}>#{team.team_id}</span>
                  <div className={s.actionLink}>
                    MANAGE <FontAwesomeIcon icon={Icons.faChevronRight} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayingTeams;