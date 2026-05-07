import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVenus, faMars, faCircleNotch, faCheck, faSync, faTrashAlt, faTrophy, faArrowRight, faLock } from '@fortawesome/free-solid-svg-icons';
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

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('team_name', { ascending: true });
    
    if (!error && data) {
      setTeams(data);
      // Logic to check if pooling was already finalized in a real scenario:
      // if (data.every(t => t.group_name) && data.length > 0) setIsLocked(true);
    }
    setLoading(false);
  };

  const executeAction = async () => {
    const { team, group, type } = confModal;
    
    if (type === 'finalize') {
      setIsLocked(true);
      setConfModal({ show: false });
      // LOGIC: Trigger points table generation here via Supabase RPC or Function
      console.log("Generating Points Tables for Group Stages...");
      return;
    }

    const isRemoving = group === "null";
    const finalValue = isRemoving ? null : group;
    
    setConfModal({ show: false, team: null, group: null });

    const { error } = await supabase
      .from('teams')
      .update({ group_name: finalValue })
      .eq('id', team.id);

    if (!error) {
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, group_name: finalValue } : t));
    }
  };

  if (loading) return (
    <div className={s.fullPageLoader}>
      <FontAwesomeIcon icon={faCircleNotch} spin /> 
      <span>SYNCHRONIZING_CORE...</span>
    </div>
  );

  return (
    <div className={s.container}>
      {/* ADAPTIVE SYSTEM MODAL */}
      {confModal.show && (
        <div className={s.modalOverlay}>
          <div className={`${s.modalCard} ${s[confModal.type]}`}>
            <div className={s.modalIcon}>
              <FontAwesomeIcon icon={confModal.type === 'remove' ? faTrashAlt : confModal.type === 'finalize' ? faTrophy : faCheck} />
            </div>
            <h3>{confModal.type === 'finalize' ? 'Finalize Structure?' : 'Confirm Change'}</h3>
            <p>
              {confModal.type === 'finalize' 
                ? 'This will lock all pools and initialize the points table for the group stage.'
                : `Are you sure you want to ${confModal.type} ${confModal.team?.team_name}?`}
            </p>
            <div className={s.modalActions}>
              <button className={s.cancelBtn} onClick={() => setConfModal({ show: false })}>ABORT</button>
              <button className={s.confirmBtn} onClick={executeAction}>CONFIRM</button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className={s.header}>
        <div className={s.titleBox}>
          <h1>POOLING <span className={s.highlight}>SYSTEM</span></h1>
          <div className={s.statusTag}>
            <FontAwesomeIcon icon={isLocked ? faLock : faSync} spin={!isLocked} />
            {isLocked ? 'STAGE: LOCKED / SCORING ACTIVE' : 'STAGE: ACTIVE POOLING'}
          </div>
        </div>
        <div className={s.headerActions}>
          {!isLocked && (
            <button onClick={fetchTeams} className={s.syncBtn}><FontAwesomeIcon icon={faSync} /> SYNC</button>
          )}
          {!isLocked && teams.filter(t => !t.group_name).length === 0 && teams.length > 0 && (
            <button className={s.finalizeBtn} onClick={() => setConfModal({ show: true, type: 'finalize' })}>
              FINALIZE POOLS <FontAwesomeIcon icon={faArrowRight} />
            </button>
          )}
        </div>
      </div>

      {/* POOL GRID (GAPS IMPLEMENTED) */}
      <div className={s.divisionWrapper}>
        {poolConfig.map(cat => (
          <div key={cat.gender} className={s.genderColumn}>
            <div className={s.genderTitle}>
              <FontAwesomeIcon icon={cat.gender === 'Girls' ? faVenus : faMars} /> {cat.gender.toUpperCase()} DIVISION
            </div>
            <div className={s.poolGapGrid}>
              {cat.groups.map(group => {
                const assignedTeams = teams.filter(t => t.group_name?.toLowerCase() === group.toLowerCase());
                return (
                  <div key={group} className={`${s.groupCard} ${isLocked ? s.lockedCard : ''}`}>
                    <div className={s.groupHeader}>
                      <span>{group}</span>
                      <span className={s.counter}>{assignedTeams.length}/4</span>
                    </div>
                    <div className={s.slotList}>
                      {Array.from({ length: 4 }).map((_, i) => {
                        const team = assignedTeams[i];
                        return (
                          <div key={i} className={`${s.slot} ${team ? s.filled : s.empty}`}>
                            {team ? (
                              <>
                                <span className={s.teamLabel}>{team.team_name}</span>
                                {!isLocked && (
                                  <button onClick={() => setConfModal({ show: true, team, group: "null", type: 'remove' })} className={s.iconBtnRed}>
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                  </button>
                                )}
                              </>
                            ) : <span>VACANT SLOT</span>}
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

      {/* DRAFTING ZONE (REMOVED WHEN LOCKED) */}
      {!isLocked && (
        <div className={s.draftZone}>
          <div className={s.draftHeader}>
            <h2>DRAFTING AREA</h2>
            <span className={s.draftCount}>{teams.filter(t => !t.group_name).length} PENDING</span>
          </div>
          <div className={s.draftList}>
            {teams.filter(t => !t.group_name).map(team => (
              <div key={team.id} className={s.draftCard}>
                <div className={s.draftInfo}>
                  <span className={s.teamTitle}>{team.team_name}</span>
                  <span className={`${s.gTag} ${team.pool === 'GIRLS' ? s.pink : s.blue}`}>
                    {team.pool === 'GIRLS' ? 'GIRLS' : 'BOYS'}
                  </span>
                </div>
                <select 
                  className={s.poolSelect} 
                  onChange={(e) => setConfModal({ show: true, team, group: e.target.value, type: 'assign' })}
                  value=""
                >
                  <option value="" disabled>ASSIGN TO...</option>
                  <optgroup label="Available Groups">
                    <option value={`${team.pool} Group A`}>Pool A</option>
                    <option value={`${team.pool} Group B`}>Pool B</option>
                  </optgroup>
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