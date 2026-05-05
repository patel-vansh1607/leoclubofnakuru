import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCircleCheck, 
  faSync, 
  faExclamationTriangle, 
  faQrcode 
} from '@fortawesome/free-solid-svg-icons';
import s from './ScoreVerify.module.css';

const ScoreVerify = () => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  // Custom Double-Tone Success Chime
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
    playNote(660, 0, 0.15); // Tone A
    playNote(880, 0.1, 0.2); // Tone B
  };

  const verifyPlayer = async (scannedId) => {
    if (loading || player) return;
    setLoading(true);
    setError(null);
    
    try {
      // Querying the players table using player_id (Text) instead of UUID id
      const { data, error: dbError } = await supabase
        .from('players')
        .select('*, teams(team_name)')
        .eq('player_id', scannedId)
        .single();

      if (dbError || !data) {
        setError("INVALID PLAYER ID");
        setTimeout(() => setError(null), 3000);
      } else {
        playProChime();
        setPlayer(data);
        // Clear scanner to save resources once player is found
        if (scannerRef.current) scannerRef.current.clear();
      }
    } catch (err) {
      setError("SERVER CONNECTION ERROR");
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
      {/* 1. LOADING OVERLAY */}
      {loading && (
        <div className={s.loaderWrapper}>
          <div className={s.spinner}></div>
          <p className={s.loaderText}>VERIFYING DATABASE...</p>
        </div>
      )}

      {/* 2. SCANNER VIEW (Only shows when not loading or showing results) */}
      {!player && !loading && (
        <div className={s.scanZone}>
          <div className={s.viewfinder}>
            <div id="reader"></div>
            <div className={s.overlayLabel}>
                <FontAwesomeIcon icon={faQrcode} /> LEO CUP SCANNER
            </div>
          </div>
          {error && (
            <div className={s.toastError}>
              <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
            </div>
          )}
        </div>
      )}

      {/* 3. BENTO RESULT CARD */}
      {player && !loading && (
        <div className={s.resultWrapper}>
          <div className={s.successBadge}>
            <FontAwesomeIcon icon={faCircleCheck} />
            PLAYER VERIFIED
          </div>

          <div className={s.bentoGrid}>
            <div className={`${s.bentoBox} ${s.full}`}>
              <span className={s.label}>FULL NAME</span>
              <h2 className={s.value}>{player.name}</h2>
            </div>

            <div className={s.bentoBox}>
              <span className={s.label}>TEAM NAME</span>
              <p className={s.value}>{player.teams?.team_name || 'N/A'}</p>
            </div>

            <div className={s.bentoBox}>
              <span className={s.label}>JERSEY NO.</span>
              <p className={s.valueHighlight}>#{player.jersey_number || '00'}</p>
            </div>

            <div className={`${s.bentoBox} ${s.full}`}>
              <span className={s.label}>SYSTEM IDENTIFIER</span>
              <p className={s.idValue}>{player.player_id}</p>
            </div>
          </div>

          <button className={s.actionBtn} onClick={startScanner}>
            <FontAwesomeIcon icon={faSync} /> SCAN NEXT PLAYER
          </button>
        </div>
      )}
    </div>
  );
};

export default ScoreVerify;