import { useState, useEffect, useRef, useCallback } from 'react';
import { getBGMManager, setSfxVolume } from '../utils/soundManager';

/**
 * Custom hook to manage background music and sound effects volumes.
 * Extracted from App.jsx to improve architecture and separate concerns.
 */
export const useAudio = (initialBgmVol = 0.3, initialSfxVol = 0.5) => {
    const [bgmVol, setBgmVol] = useState(initialBgmVol);
    const [sfxVol, setSfxVolState] = useState(initialSfxVol);
    
    // Use a ref to persist the BGM manager instance across renders
    const bgmManager = useRef(getBGMManager());

    // Synchronize BGM volume state with the underlaying audio manager
    useEffect(() => {
        bgmManager.current.setVolume(bgmVol);
    }, [bgmVol]);

    // Synchronize SFX volume state with the underlying audio manager
    useEffect(() => {
        setSfxVolume(sfxVol);
    }, [sfxVol]);

    // Start background music (must be called after a user interaction)
    const startBGM = useCallback(() => {
        if (!bgmManager.current.isPlaying) {
            bgmManager.current.play();
        }
    }, []);

    return {
        bgmVol,
        setBgmVol,
        sfxVol,
        setSfxVolState,
        startBGM
    };
};
