import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import { useReactToPrint } from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import s from './TeamDetails.module.css';

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Print Logic
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${team?.team_name}_Manifest`,
  });

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select(`*, players (*)`)
        .eq('id', teamId)
        .single();
      
      if (!error) setTeam(data);
      setLoading(false);
    };
    if (teamId) fetchTeamData();
  }, [teamId]);

  // Download Helper
  const downloadSVG = (elementId, fileName) => {
    const svg = document.getElementById(elementId);
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(svgBlob, `${fileName.replace(/\s+/g, '_')}.svg`);
  };

  if (loading || !team) return <div className={s.statusScreen}>LOADING...</div>;

  const sortedPlayers = team.players?.sort((a, b) => a.id - b.id) || [];

  return (
    <div className={s.page}>
      {/* Hidden QR for Team Download */}
      <div style={{ display: 'none' }}>
        <QRCodeSVG id="team-qr-main" value={team.team_id} bgColor="none" fgColor="#000" />
      </div>

      <div className={s.headerNav}>
        <button className={s.backLink} onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={Icons.faArrowLeft} /> BACK
        </button>
        <div className={s.headerActions}>
          {/* <button className={s.actionBtn} onClick={handlePrint}> */}
            {/* <FontAwesomeIcon icon={Icons.faPrint} /> PRINT_ALL_CARDS */}
          {/* </button> */}
        </div>
      </div>

      <div className={s.hero}>
        <div className={s.heroContent}>
          <div className={s.poolIndicator}>{team.pool} POOL</div>
          <h1 className={s.teamName}>{team.team_name}</h1>
          <div className={s.statsBar}>
            <div className={s.statItem}>
              <label>TEAM_ID</label>
              <span>{team.team_id}</span>
            </div>
            <div className={s.statItem}>
              <label>SQUAD_SIZE</label>
              <span>{sortedPlayers.length} / 12</span>
            </div>
          </div>
        </div>

        {/* New Team Download Section on Hero */}
        <div className={s.teamQrContainer}>
          <QRCodeSVG value={team.team_id} size={80} bgColor="transparent" fgColor="#f1c40f" />
          <button className={s.teamDlBtn} onClick={() => downloadSVG('team-qr-main', `${team.team_name}_TEAM_CODE`)}>
            <FontAwesomeIcon icon={Icons.faDownload} /> DOWNLOAD_TEAM_SVG
          </button>
        </div>
      </div>

      {/* Container for Printing */}
      <div ref={printRef} className={s.printableArea}>
        <div className={s.rosterSection}>
          <h3 className={s.sectionTitle}>PLAYER_MANIFEST_2026</h3>
          <div className={s.playerGrid}>
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className={s.playerCard}>
                <div style={{ display: 'none' }}>
                  <QRCodeSVG id={`qr-${player.id}`} value={player.player_id} bgColor="none" fgColor="#000" />
                </div>
                
                <div className={s.jerseySection}>
                  <span className={s.jerseyNum}>{player.jersey_number}</span>
                </div>

                <div className={s.playerDetails}>
                  <h4 className={s.playerName}>{player.name}</h4>
                  <p className={s.playerUid}>{player.player_id}</p>
                </div>

                <button 
                  className={s.downloadBtn} 
                  onClick={(e) => { e.stopPropagation(); downloadSVG(`qr-${player.id}`, player.name); }}
                >
                  <FontAwesomeIcon icon={Icons.faDownload} />
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