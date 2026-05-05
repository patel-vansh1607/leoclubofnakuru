import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
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
  const isProcessing = useRef(false); // Ref to prevent race conditions during rapid scans

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

  const verifyPlayer = useCallback(async (scannedId) => {
    // If already processing or player shown, exit immediately for speed
    if (isProcessing.current || player) return;
    
    isProcessing.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: dbError } = await supabase
        .from('players')
        .select('*, teams(team_name)')
        .eq('player_id', scannedId)
        .single();

      if (dbError || !data) {
        setError("INVALID PLAYER ID");
        isProcessing.current = false; // Allow re-scan immediately
        setTimeout(() => setError(null), 2000);
      } else {
        playProChime();
        setPlayer(data);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error("Failed to clear", err));
        }
      }
    } catch (err) {
      setError("SERVER ERROR");
      isProcessing.current = false;
    } finally {
      setLoading(false);
    }
  }, [player]);

  const startScanner = useCallback(() => {
    isProcessing.current = false;
    setPlayer(null);
    setError(null);

    // Small delay to ensure the DOM element #reader is ready
    setTimeout(() => {
      const config = {
        fps: 60, // Cranked up for high-speed tracking
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        // Prioritize the back camera and disable video selection UI for speed
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      };

      const scanner = new Html5QrcodeScanner('reader', config, false);
      scanner.render(verifyPlayer, (err) => {
        // Silent fail on scan errors (common during movement) to keep it smooth
      });
      scannerRef.current = scanner;
    }, 50);
  }, [verifyPlayer]);

  useEffect(() => {
    startScanner();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error(err));
      }
    };
  }, [startScanner]);

  return (
    <div className={s.container}>
      {loading && (
        <div className={s.loaderWrapper}>
          <div className={s.spinner}></div>
          <p className={s.loaderText}>FAST-TRACKING...</p>
        </div>
      )}

      {!player && !loading && (
        <div className={s.scanZone}>
          <div className={s.viewfinder}>
            <div id="reader"></div>
            <div className={s.overlayLabel}>
                <FontAwesomeIcon icon={faQrcode} /> READY FOR SCAN
            </div>
          </div>
          {error && (
            <div className={s.toastError}>
              <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
            </div>
          )}
        </div>
      )}

      {player && !loading && (
        <div className={s.resultWrapper}>
          <div className={s.successBadge}>
            <FontAwesomeIcon icon={faCircleCheck} /> VERIFIED
          </div>

          <div className={s.bentoGrid}>
            <div className={`${s.bentoBox} ${s.full}`}>
              <span className={s.label}>PLAYER</span>
              <h2 className={s.value}>{player.name}</h2>
            </div>
            <div className={s.bentoBox}>
              <span className={s.label}>TEAM</span>
              <p className={s.value}>{player.teams?.team_name || 'UNASSIGNED'}</p>
            </div>
            <div className={s.bentoBox}>
              <span className={s.label}>NO.</span>
              <p className={s.valueHighlight}>#{player.jersey_number || '00'}</p>
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