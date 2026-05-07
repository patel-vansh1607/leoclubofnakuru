import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import { useReactToPrint } from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPrint, faDownload, faUsers, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import s from './TeamDetails.module.css';

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: team ? `${team.team_name}_ROSTER` : 'TEAM_ROSTER',
  });

  const fetchTeamData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select(`*, players (*)`)
      .eq('id', teamId)
      .single();
    
    if (!error) setTeam(data);
    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    if (teamId) fetchTeamData();
  }, [teamId, fetchTeamData]);

  const downloadSVG = (elementId, fileName) => {
    const svg = document.getElementById(elementId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(svgBlob, `${fileName.replace(/\s+/g, '_')}.svg`);
  };

  if (loading || !team) return <div className={s.loader}><div className={s.spinner}></div></div>;

  const sortedPlayers = team.players?.sort((a, b) => a.id - b.id) || [];

  return (
    <div className={s.page}>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');
      </style>

      {/* Hidden Team QR */}
      <div style={{ display: 'none' }}>
        <QRCodeSVG id="team-qr-main" value={team.team_id} bgColor="none" fgColor="#000" />
      </div>

      <header className={s.navBar}>
        <button className={s.backBtn} onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> <span>BROWSE_ALL</span>
        </button>
        <div className={s.navActions}>
          <button className={s.printBtn} onClick={handlePrint}>
            <FontAwesomeIcon icon={faPrint} /> PRINT_BATCH
          </button>
        </div>
      </header>

      <section className={s.hero}>
        <div className={s.heroMain}>
          <div className={s.badge}>
            <FontAwesomeIcon icon={faShieldHalved} /> {team.pool} DIVISION
          </div>
          <h1 className={s.teamTitle}>{team.team_name}</h1>
          <div className={s.heroStats}>
            <div className={s.hStat}>
              <label>REFERENCE_HASH</label>
              <p>{team.team_id}</p>
            </div>
            <div className={s.hStat}>
              <label>VERIFIED_ATHLETES</label>
              <p>{sortedPlayers.length} / 12</p>
            </div>
          </div>
        </div>

        <div className={s.qrDossier}>
          <div className={s.qrWrapper}>
            <QRCodeSVG value={team.team_id} size={90} bgColor="transparent" fgColor="#f1c40f" />
          </div>
          <button className={s.dlTeamCode} onClick={() => downloadSVG('team-qr-main', `${team.team_name}_KEY`)}>
            <FontAwesomeIcon icon={faDownload} /> GET_KEY
          </button>
        </div>
      </section>

      <div className={s.contentSection}>
        <div className={s.sectionHeader}>
          <div className={s.sectionTitle}>
            <FontAwesomeIcon icon={faUsers} />
            <h3>ATHLETE_ROSTER</h3>
          </div>
          <div className={s.titleLine}></div>
        </div>

        <div ref={printRef} className={s.printableArea}>
          <div className={s.playerGrid}>
            {sortedPlayers.map((player, i) => (
              <div key={player.id} className={s.playerCard}>
                <div style={{ display: 'none' }}>
                  <QRCodeSVG id={`qr-${player.id}`} value={player.player_id} bgColor="none" fgColor="#000" />
                </div>
                
                <div className={s.cardIdentity}>
                  <div className={s.jerseyBox}>
                    <span className={s.jNum}>{player.jersey_number}</span>
                  </div>
                  <div className={s.pMeta}>
                    <h4 className={s.pName}>{player.name}</h4>
                    <span className={s.pUid}>{player.player_id}</span>
                  </div>
                </div>

                <button 
                  className={s.pDlBtn} 
                  onClick={(e) => { e.stopPropagation(); downloadSVG(`qr-${player.id}`, player.name); }}
                >
                  <FontAwesomeIcon icon={faDownload} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;