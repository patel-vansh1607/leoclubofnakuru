import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol, faHandshake, faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';
import s from './ScoringTerminal.module.css';

const ScoringTerminal = () => {
  const [scannedPlayer, setScannedPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Move success logic into useCallback
  const onScanSuccess = useCallback(async (decodedText) => {
    if (loading || scannedPlayer) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('players')
      .select('*, teams(team_name)')
      .eq('player_id', decodedText)
      .single();

    if (data) {
      setScannedPlayer(data);
      if (window.navigator.vibrate) window.navigator.vibrate(100);
    } else {
      console.error("Player not found", error);
    }
    setLoading(false);
  }, [loading, scannedPlayer]); // Dependencies for callback

  // 2. Move failure logic into useCallback
  const onScanFailure = useCallback((error) => {
    // Silently handle scan frame misses
  }, []);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0
    });

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(error => console.error("Scanner cleanup failed", error));
    };
  }, [onScanSuccess, onScanFailure]); // dependencies are now stable

  const recordStat = async (field, currentValue) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('players')
      .update({ [field]: (currentValue || 0) + 1 })
      .eq('id', scannedPlayer.id);

    if (!error) {
      setScannedPlayer(null); 
      const toast = document.createElement('div');
      toast.className = s.toast;
      toast.innerText = `DATABASE UPDATED: ${field.toUpperCase()}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } else {
      alert("UPDATE_FAILED: Check Connection");
    }
    setIsUpdating(false);
  };

  return (
    <div className={s.container}>
      <div className={s.scannerWrapper}>
        <div id="reader" className={s.reader}></div>
        <div className={s.scanOverlay}>
          <div className={s.cornerTopLeft} />
          <div className={s.cornerTopRight} />
          <div className={s.cornerBottomLeft} />
          <div className={s.cornerBottomRight} />
        </div>
      </div>

      {loading && (
        <div className={s.loadingOverlay}>
          <FontAwesomeIcon icon={faSpinner} spin /> 
          <span>ANALYZING...</span>
        </div>
      )}

      {scannedPlayer && (
        <div className={s.actionOverlay}>
          <div className={s.actionCard}>
            <button className={s.closeBtn} onClick={() => setScannedPlayer(null)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
            
            <div className={s.playerHeader}>
              <div className={s.jerseyCircle}>{scannedPlayer.jersey_number}</div>
              <div className={s.pInfo}>
                <h2>{scannedPlayer.name}</h2>
                <p>{scannedPlayer.teams?.team_name}</p>
              </div>
            </div>

            <div className={s.currentStats}>
              <div className={s.statBox}>Goals: <span>{scannedPlayer.goals || 0}</span></div>
              <div className={s.statBox}>Assists: <span>{scannedPlayer.assists || 0}</span></div>
            </div>

            <div className={s.btnGroup}>
              <button 
                disabled={isUpdating} 
                onClick={() => recordStat('goals', scannedPlayer.goals)} 
                className={s.goalBtn}
              >
                <FontAwesomeIcon icon={faFutbol} />
                <span>+1 GOAL</span>
              </button>
              
              <button 
                disabled={isUpdating} 
                onClick={() => recordStat('assists', scannedPlayer.assists)} 
                className={s.assistBtn}
              >
                <FontAwesomeIcon icon={faHandshake} />
                <span>+1 ASSIST</span>
              </button>
            </div>
            {isUpdating && <p className={s.syncingText}>SYNCING WITH LEO CUP CLOUD...</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoringTerminal;