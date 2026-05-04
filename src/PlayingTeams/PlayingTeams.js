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
    // Fetching teams with nested players to identify the captain (Player One)
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        players (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch Error:", error);
    } else {
      setTeams(data);
    }
    setLoading(false);
  };

  const filteredTeams = teams.filter(team => 
    team.pool === activePool && 
    team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.topRow}>
<div className={s.adminBadge}>
  <FontAwesomeIcon icon={Icons.faShield} /> SYSTEM_OVERSIGHT
</div>
          <div className={s.searchBox}>
            <FontAwesomeIcon icon={Icons.faSearch} className={s.searchIcon} />
            <input 
              type="text" 
              placeholder="SEARCH TEAMS..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={s.mainTitleRow}>
          <h1 className={s.title}>Registered_Teams</h1>
          <div className={s.poolSwitch}>
            <button 
              className={activePool === 'BOYS' ? s.active : ''} 
              onClick={() => setActivePool('BOYS')}
            >BOYS_POOL</button>
            <button 
              className={activePool === 'GIRLS' ? s.active : ''} 
              onClick={() => setActivePool('GIRLS')}
            >GIRLS_POOL</button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className={s.loaderContainer}>
          <div className={s.spinner}></div>
          <p>RETRIEVING_DATA...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className={s.emptyState}>
          <FontAwesomeIcon icon={Icons.faInbox} className={s.emptyIcon} />
          <p>NO_TEAMS_FOUND_IN_{activePool}_POOL</p>
        </div>
      ) : (
        <div className={s.teamGrid}>
          {filteredTeams.map(team => {
            // Logic: The first player in the array is the Captain by default
            const captain = team.players && team.players.length > 0 
              ? team.players.sort((a, b) => a.id - b.id)[0].name 
              : "NO_PLAYERS_YET";

            return (
              <div 
                key={team.id} 
                className={s.teamCard} 
                onClick={() => navigate(`/dashboard/playing-teams/${team.id}`)}
              >
                <div className={s.cardBody}>
                  <div className={s.teamInfo}>
                    <h2 className={s.teamName}>{team.team_name}</h2>
                    <div className={s.captainInfo}>
                      <FontAwesomeIcon icon={Icons.faUserTie} className={s.capIcon} />
                      <span>{captain}</span>
                    </div>
                  </div>
                  <div className={s.playerStats}>
                    <div className={s.countBox}>
                      <span className={s.countNumber}>{team.players?.length || 0}</span>
                      <span className={s.countLabel}>PLAYERS</span>
                    </div>
                  </div>
                </div>
                <div className={s.cardFooter}>
                  <span className={s.refId}>REF: {team.team_id}</span>
                  <span className={s.viewBtn}>VIEW_DETAILS <FontAwesomeIcon icon={Icons.faArrowRight} /></span>
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