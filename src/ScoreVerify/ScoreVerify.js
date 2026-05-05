import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShield, 
  faCircleCheck, 
  faSync, 
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import s from './ScoreVerify.module.css';

const ScoreVerify = () => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  // High-end double-tone chime (Success Sound)
  const playProChime = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const playNote = (freq, start, duration) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, context.currentTime + start);
      osc.connect(gain);
      gain.connect(context.destination);
      gain.gain.setValueAtTime(0, context.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.1, context.currentTime + start + 0.05);
      gain.gain.linearRampToValueAtTime(0, context.currentTime + start + duration);
      osc.start(context.currentTime + start);
      osc.stop(context.currentTime + start + duration);
    };
    playNote(660, 0, 0.15); 
    playNote(880, 0.1, 0.2); 
  };

  const verifyPlayer = async (scannedId) => {
    if (loading || player) return;
    setLoading(true);
    
    try {
      const { data, error: dbError } = await supabase
        .from('players')
        .select('*, teams(team_name)')
        .eq('player_id', scannedId)
        .single();

      if (dbError || !data) {
        setError("Unknown Player ID");
        setTimeout(() => setError(null), 3000);
      } else {
        playProChime();
        setPlayer(data);
        if (scannerRef.current) scannerRef.current.clear();
      }
    } catch (err) {
      setError("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const startScanner = () => {
    setPlayer(null);
    setError(null);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('reader', {
        fps: 20,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      });
      scanner.render(verifyPlayer);
      scannerRef.current = scanner;
    }, 100);
  };

  useEffect(() => {
    startScanner();
    return () => { if (scannerRef.current) scannerRef.current.clear(); };
  }, []);

  return (
    <div className={s.container}>
      {!player ? (
        <div className={s.scanZone}>
          <div className={s.viewfinder}>
            <div id="reader"></div>
            <div className={s.overlayLabel}>SCAN PLAYER PASS</div>
          </div>
          {error && (
            <div className={s.toastError}>
              <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
            </div>
          )}
        </div>
      ) : (
        <div className={s.resultWrapper}>
          <div className={s.successBadge}>
            <FontAwesomeIcon icon={faCircleCheck} />
            VERIFIED
          </div>

          <div className={s.bentoGrid}>
            <div className={`${s.bentoBox} ${s.full}`}>
              <span className={s.label}>PLAYER NAME</span>
              <h2 className={s.value}>{player.name}</h2>
            </div>

            <div className={s.bentoBox}>
              <span className={s.label}>TEAM</span>
              <p className={s.value}>{player.teams?.team_name || 'N/A'}</p>
            </div>

            <div className={s.bentoBox}>
              <span className={s.label}>JERSEY</span>
              <p className={s.valueHighlight}>#{player.jersey_number || '00'}</p>
            </div>

            <div className={`${s.bentoBox} ${s.full}`}>
              <span className={s.label}>OFFICIAL ID</span>
              <p className={s.idValue}>{player.player_id}</p>
            </div>
          </div>

          <button className={s.actionBtn} onClick={startScanner}>
            <FontAwesomeIcon icon={faSync} /> NEXT SCAN
          </button>
        </div>
      )}
    </div>
  );
};

export default ScoreVerify;