import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faSync, faBolt } from '@fortawesome/free-solid-svg-icons';
import s from './ScoreVerify.module.css';

const ScoreVerify = () => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const scannerRef = useRef(null);
  const isProcessing = useRef(false);

  const handleScan = useCallback(async (decodedText) => {
    // 1. LOG EVERYTHING IMMEDIATELY
    console.log("🔍 RAW DATA DETECTED:", decodedText);

    // 2. CHECK FORMAT (Case-insensitive check for reliability)
    const upperText = decodedText.toUpperCase();
    if (isProcessing.current || !upperText.includes('LEO-CUP-')) {
      if (isProcessing.current) console.warn("⏳ Busy processing another scan...");
      return;
    }

    console.log("🎯 VALID ID DETECTED. FETCHING...");
    isProcessing.current = true; // LOCK
    setLoading(true);
    setStatus("VERIFYING ID...");

    try {
      const { data, error } = await supabase
        .from('players')
        .select('name, jersey_number, teams(team_name)')
        .eq('player_id', upperText) // Using the exact ID from the QR
        .single();

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
        // Release lock after 2 seconds to allow re-scan
        setTimeout(() => {
          isProcessing.current = false;
          setStatus("READY FOR SCAN");
        }, 2000);
      }
    } catch (err) {
      console.error("🚨 CRITICAL DB ERROR:", err);
      isProcessing.current = false;
    } finally {
      setLoading(false);
    }
  }, []);

  const startScanner = async () => {
    console.log("📸 OPENING CAMERA...");
    setPlayer(null);
    isProcessing.current = false;
    setStatus("Waiting for Camera...");

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      // Configuration for instant detection
      const config = { 
        fps: 30, // High frame rate
        // We removed qrbox so it scans the WHOLE screen, not just the center
        aspectRatio: 1.0 
      };

      await html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        handleScan,
        (errorMessage) => {
           // This fires every frame it DOESN'T find a QR. 
           // Leave empty to avoid spamming the console.
        }
      );
      
      console.log("🟢 SCANNER ACTIVE - FULL SCREEN MODE");
      setStatus("READY FOR SCAN");
    } catch (err) {
      console.error("🔴 CAMERA INIT ERROR:", err);
      setStatus("ERROR: CHECK PERMISSIONS");
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.log("Cleanup error", e));
      }
    };
  }, []);

  return (
    <div className={s.container}>
      {!player ? (
        <div className={s.scanZone}>
          <div className={s.readerWrapper}>
            <div id="reader" className={s.fullReader}></div>
            {/* Visual Scan Line */}
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