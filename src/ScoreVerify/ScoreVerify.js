import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faSync, faBolt } from '@fortawesome/free-solid-svg-icons';
import s from './ScoreVerify.module.css';

const ScoreVerify = () => {
  const [player, setPlayer] = useState(null);
  // Removed 'loading' since it was unused
  const [status, setStatus] = useState("Initializing...");
  const scannerRef = useRef(null);
  const isProcessing = useRef(false);

  const handleScan = useCallback(async (decodedText) => {
    console.log("🔍 RAW DATA DETECTED:", decodedText);

    const upperText = decodedText.toUpperCase();
    if (isProcessing.current || !upperText.includes('LEO-CUP-')) {
      if (isProcessing.current) console.warn("⏳ Busy processing another scan...");
      return;
    }

    console.log("🎯 VALID ID DETECTED. FETCHING...");
    isProcessing.current = true;
    setStatus("VERIFYING ID...");

    try {
      // Renamed unused 'error' to '_error' to satisfy linter or removed if not needed
      const { data, error: _error } = await supabase
        .from('players')
        .select('name, jersey_number, teams(team_name)')
        .eq('player_id', upperText)
        .single();

      if (_error) throw _error;

      if (data) {
        console.log("✅ MATCH FOUND:", data.name);
        setPlayer(data);
        if (scannerRef.current) {
          await scannerRef.current.stop();
          console.log("🛑 CAMERA STOPPED");
        }
      } else {
        console.error("❌ DB CHECK: ID not found in Players table.");
        setStatus("ID NOT REGISTERED");
        setTimeout(() => {
          isProcessing.current = false;
          setStatus("READY FOR SCAN");
        }, 2000);
      }
    } catch (err) {
      console.error("🚨 CRITICAL DB ERROR:", err);
      isProcessing.current = false;
      setStatus("ERROR FETCHING DATA");
    }
  }, []);

  // Wrapped in useCallback to fix useEffect dependency warning
  const startScanner = useCallback(async () => {
    console.log("📸 OPENING CAMERA...");
    setPlayer(null);
    isProcessing.current = false;
    setStatus("Waiting for Camera...");

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      const config = { 
        fps: 30, 
        aspectRatio: 1.0 
      };

      await html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        handleScan,
        () => {} // Empty error callback
      );
      
      console.log("🟢 SCANNER ACTIVE - FULL SCREEN MODE");
      setStatus("READY FOR SCAN");
    } catch (err) {
      console.error("🔴 CAMERA INIT ERROR:", err);
      setStatus("ERROR: CHECK PERMISSIONS");
    }
  }, [handleScan]);

  useEffect(() => {
    startScanner();
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.log("Cleanup error", e));
      }
    };
  }, [startScanner]); // startScanner is now a stable dependency

  return (
    <div className={s.container}>
      {!player ? (
        <div className={s.scanZone}>
          <div className={s.readerWrapper}>
            <div id="reader" className={s.fullReader}></div>
            <div className={s.scannerOverlay}>
               <div className={s.scanLine}></div>
            </div>
          </div>
          
          <div className={s.footer}>
            <div className={s.statusTag}>STATUS: {status}</div>
            <p className={s.hint}><FontAwesomeIcon icon={faBolt} /> POINT AT PLAYER ID</p>
          </div>
        </div>
      ) : (
        <div className={s.resultCard}>
          <div className={s.verifiedIcon}><FontAwesomeIcon icon={faCircleCheck} /></div>
          <h1 className={s.pName}>{player.name}</h1>
          <h3 className={s.tName}>{player.teams?.team_name || "NO TEAM"}</h3>
          <div className={s.jerseyBadge}>#{player.jersey_number}</div>
          <button className={s.resetBtn} onClick={startScanner}>
            <FontAwesomeIcon icon={faSync} /> NEXT PLAYER
          </button>
        </div>
      )}
    </div>
  );
};

export default ScoreVerify;