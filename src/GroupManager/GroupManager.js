import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVenus, faMars, faCircleNotch, faCheck, 
  faSync, faTrashAlt, faTrophy, faArrowRight, 
  faLock, faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import s from './GroupManager.module.css';

const GroupManager = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [confModal, setConfModal] = useState({ show: false, team: null, group: null, type: 'assign' });

  const poolConfig = [
    { gender: 'Girls', groups: ['Girls Group A', 'Girls Group B'] },
    { gender: 'Boys', groups: ['Boys Group A', 'Boys Group B'] }
  ];

  useEffect(() => { 
    fetchTeams(); 
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('team_name', { ascending: true });
    
    if (!error && data) {
      setTeams(data);
      // Optional: Auto-detect lock status from a settings table if you have one
      // Or check if a specific "finalized" flag is set in your DB
    }
    setLoading(false);
  };

  const executeAction = async () => {
    const { team, group, type } = confModal;
    
    // ACTION: FINALIZE ENTIRE TOURNAMENT STRUCTURE
    if (type === 'finalize') {
      setLoading(true);
      // In a real app, you might call a Supabase RPC function here to 
      // generate the actual match schedules based on these groups.
      setTimeout(() => {
        setIsLocked(true);
        setConfModal({ show: false });
        setLoading(false);
      }, 1500);
      return;
    }

    // ACTION: INDIVIDUAL TEAM ASSIGNMENT
    const isRemoving = group === "null";
    const finalValue = isRemoving ? null : group;
    
    setConfModal({ show: false, team: null, group: null });

    const { error } = await supabase
      .from('teams')
      .update({ group_name: finalValue })
      .eq('id', team.id);

    if (!error) {
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, group_name: finalValue } : t));
    } else {
      alert("Database Error: Could not update team.");
    }
  };

  // CHECK: Are all teams assigned? (Required for Finalization)
  const allTeamsAssigned = teams.length > 0 && teams.every(t => t.group_name !== null);

  if (loading) return (
    <div className={s.fullPageLoader}>
      <div className={s.loaderRing}>
        <FontAwesomeIcon icon={faCircleNotch} spin /> 
      </div>
      <span>SYNCHRONIZING_CORE...</span>
    </div>
  );

  return (
    <div className={s.container}>
      {/* SYSTEM MODAL */}
      {confModal.show && (
        <div className={s.modalOverlay}>
          <div className={`${s.modalCard} ${s[confModal.type]}`}>
            <div className={s.modalIcon}>
              <FontAwesomeIcon icon={
                confModal.type === 'remove' ? faTrashAlt : 
                confModal.type === 'finalize' ? faTrophy : faCheck
              } />
            </div>
            <h3>{confModal.type === 'finalize' ? 'FINALIZE_STRUCTURE' : 'CONFIRM_ACTION'}</h3>
            <p>
              {confModal.type === 'finalize' 
                ? 'This action is permanent. All pools will be locked and match scheduling will initialize.'
                : `Move ${confModal.team?.team_name} to ${confModal.group === 'null' ? 'Drafting' : confModal.group}?`}
            </p>
            <div className={s.modalActions}>
              <button className={s.cancelBtn} onClick={() => setConfModal({ show: false })}>ABORT</button>
              <button className={s.confirmBtn} onClick={executeAction}>CONFIRM_EXECUTION</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className={s.header}>
        <div className={s.titleBox}>
          <h1>POOLING <span className={s.highlight}>SYSTEM</span></h1>
          <div className={`${s.statusTag} ${isLocked ? s.lockedTag : ''}`}>
            <FontAwesomeIcon icon={isLocked ? faLock : faSync} spin={!isLocked} />
            {isLocked ? 'SYSTEM_LOCKED // READ_ONLY' : 'STAGE: ACTIVE_POOLING'}
          </div>
        </div>

        <div className={s.headerActions}>
          {!isLocked ? (
            <>
              <button onClick={fetchTeams} className={s.syncBtn}>
                <FontAwesomeIcon icon={faSync} /> SYNC_DB
              </button>
              {allTeamsAssigned && (
                <button className={s.finalizeBtn} onClick={() => setConfModal({ show: true, type: 'finalize' })}>
                  FINALIZE_POOLS <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </>
          ) : (
            <div className={s.lockedBadge}>
              <FontAwesomeIcon icon={faTrophy} /> TOURNAMENT_READY
            </div>
          )}
        </div>
      </div>

      {/* POOL DISPLAY GRID */}
      <div className={s.divisionWrapper}>
        {poolConfig.map(cat => (
          <div key={cat.gender} className={s.genderSection}>
            <div className={s.genderTitle}>
              <FontAwesomeIcon icon={cat.gender === 'Girls' ? faVenus : faMars} /> 
              {cat.gender.toUpperCase()} DIVISION
            </div>
            <div className={s.poolGapGrid}>
              {cat.groups.map(group => {
                const assignedTeams = teams.filter(t => t.group_name === group);
                return (
                  <div key={group} className={`${s.groupCard} ${isLocked ? s.lockedCard : ''}`}>
                    <div className={s.groupHeader}>
                      <span>{group.toUpperCase()}</span>
                      <span className={s.counter}>{assignedTeams.length} / 4</span>
                    </div>
                    <div className={s.slotList}>
                      {[...Array(4)].map((_, i) => {
                        const team = assignedTeams[i];
                        return (
                          <div key={i} className={`${s.slot} ${team ? s.filled : s.empty}`}>
                            {team ? (
                              <>
                                <span className={s.teamLabel}>{team.team_name}</span>
                                {!isLocked && (
                                  <button 
                                    onClick={() => setConfModal({ show: true, team, group: "null", type: 'remove' })} 
                                    className={s.removeBtn}
                                  >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                  </button>
                                )}
                              </>
                            ) : <span>VACANT_SLOT</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* DRAFTING ZONE */}
      {!isLocked && (
        <div className={s.draftZone}>
          <div className={s.draftHeader}>
            <div className={s.draftTitle}>
              <h2>UNASSIGNED_UNITS</h2>
              <span className={s.draftCount}>{teams.filter(t => !t.group_name).length} PENDING</span>
            </div>
            {teams.filter(t => !t.group_name).length > 0 && (
              <div className={s.warningNote}>
                <FontAwesomeIcon icon={faExclamationTriangle} /> Assign all teams to finalize.
              </div>
            )}
          </div>
          <div className={s.draftList}>
            {teams.filter(t => !t.group_name).map(team => (
              <div key={team.id} className={s.draftCard}>
                <div className={s.draftInfo}>
                  <span className={s.teamTitle}>{team.team_name}</span>
                  <span className={`${s.gTag} ${team.pool === 'GIRLS' ? s.pink : s.blue}`}>
                    {team.pool}
                  </span>
                </div>
                <select 
                  className={s.poolSelect} 
                  onChange={(e) => setConfModal({ show: true, team, group: e.target.value, type: 'assign' })}
                  value=""
                >
                  <option value="" disabled>SELECT GROUP...</option>
                  {poolConfig.find(p => p.gender === (team.pool === 'GIRLS' ? 'Girls' : 'Boys'))
                    .groups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))
                  }
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManager;