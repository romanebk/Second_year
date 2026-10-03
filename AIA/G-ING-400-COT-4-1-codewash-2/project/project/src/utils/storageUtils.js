import { SKILL_DATA } from '../constants/gameData';
import { getRandomMob, getRandomFriendlyMob, getRandomMiniboss, getRandomBoss, calculateMobHealth } from './gameUtils';
import { getRandomAura } from './mobDisplayUtils';
import { getDefaultStats } from './achievementUtils';
import { getTranslation } from './i18n';

/**
 * Get internal storage key for a profile
 */
export const getStorageKey = (profileId) => `heroSkills_v23_p${profileId}`;

/**
 * Load initial global settings (Theme, Language, Profile list)
 */
export const loadGlobalSettings = () => {
    return {
        language: localStorage.getItem('heroLanguage_v1') || 'en',
        currentProfile: (() => {
            const saved = localStorage.getItem('currentProfile_v1');
            return saved ? parseInt(saved) : 1;
        })(),
        profileNames: (() => {
            const saved = localStorage.getItem('heroProfileNames_v1');
            const lang = localStorage.getItem('heroLanguage_v1') || 'en';
            const defaultName = getTranslation('player_prefix', lang);
            return saved ? JSON.parse(saved) : { 1: `${defaultName} 1`, 2: `${defaultName} 2`, 3: `${defaultName} 3` };
        })(),
        parentStatus: (() => {
            const saved = localStorage.getItem('heroParentStatus_v1');
            return saved ? JSON.parse(saved) : { 1: false, 2: false, 3: false };
        })()
    };
};

/**
 * Load skill levels and configurations for a particular profile
 */
export const loadSkills = (profileId) => {
    const initial = {};
    SKILL_DATA.forEach(skill => {
        const initialDifficulty = 1;
        initial[skill.id] = {
            level: 1,
            xp: 0,
            currentMob: getRandomMob(null),
            difficulty: initialDifficulty,
            earnedBadges: [],
            mobHealth: calculateMobHealth(initialDifficulty),
            mobMaxHealth: calculateMobHealth(initialDifficulty),
            lostLevel: false,
            recoveryDifficulty: null,
            memoryMob: skill.id === 'memory' ? getRandomFriendlyMob() : null,
            patternMob: skill.id === 'patterns' ? getRandomMob(null) : null,
            currentMiniboss: getRandomMiniboss(),
            currentBoss: getRandomBoss(),
            readingMob: skill.id === 'reading' ? getRandomMob(null) : null,
            mathMob: skill.id === 'math' ? getRandomMob(null) : null,
            writingMob: skill.id === 'writing' ? getRandomMob(null) : null,
            triviaMob: skill.id === 'trivia' ? getRandomMob(null) : null,
            readingMobAura: skill.id === 'reading' ? getRandomAura() : null,
            mathMobAura: skill.id === 'math' ? getRandomAura() : null,
            writingMobAura: skill.id === 'writing' ? getRandomAura() : null,
            triviaMobAura: skill.id === 'trivia' ? getRandomAura() : null,
            patternMobAura: skill.id === 'patterns' ? getRandomAura() : null,
            currentMinibossAura: getRandomAura(),
            currentBossAura: getRandomAura()
        };
    });
    
    let saved = localStorage.getItem(getStorageKey(profileId));
    if (!saved && profileId === 1) saved = localStorage.getItem('heroSkills_v23');
    
    try {
        if (saved) {
            const parsed = JSON.parse(saved);
            const data = parsed.skills || parsed;
            Object.keys(data).forEach(key => {
                if (initial[key]) {
                    initial[key] = { ...initial[key], ...data[key] };
                    if (typeof initial[key].difficulty !== 'number') initial[key].difficulty = 1;
                    if (!Array.isArray(initial[key].earnedBadges)) initial[key].earnedBadges = [];
                    if (typeof initial[key].mobHealth !== 'number') {
                        const diff = initial[key].difficulty || 1;
                        initial[key].mobHealth = calculateMobHealth(diff);
                        initial[key].mobMaxHealth = calculateMobHealth(diff);
                    }
                    if (typeof initial[key].lostLevel !== 'boolean') initial[key].lostLevel = false;
                    if (initial[key].recoveryDifficulty === undefined) initial[key].recoveryDifficulty = null;
                }
            });
        }
    } catch (e) {
        console.warn('Failed to parse saved skills:', e);
    }
    return initial;
};

/**
 * Load the selected theme
 */
export const loadTheme = (profileId) => {
    let saved = localStorage.getItem(getStorageKey(profileId));
    if (!saved && profileId === 1) saved = localStorage.getItem('heroSkills_v23');
    try {
        const parsed = JSON.parse(saved);
        return parsed?.theme || 'minecraft';
    } catch {
        return 'minecraft';
    }
};

/**
 * Load user specific stats
 */
export const loadStats = (profileId) => {
    let saved = localStorage.getItem(getStorageKey(profileId));
    if (!saved && profileId === 1) saved = localStorage.getItem('heroSkills_v23');
    try {
        const data = JSON.parse(saved);
        if (data?.stats) return { ...getDefaultStats(), ...data.stats };
    } catch { 
        // silently ignore parse errors and fallback
    }
    return getDefaultStats();
};

/**
 * Extract summary statistics used by the drawer UI
 */
export const getProfileStatsData = (id, activeTheme, liveSkills = null) => {
    const initial = {};
    SKILL_DATA.forEach(skill => { initial[skill.id] = { level: 1 }; });

    if (liveSkills) {
        let totalLevel = 0;
        let highestLevel = 0;
        Object.values(liveSkills).forEach(s => {
            if (s && typeof s.level === 'number') {
                totalLevel += s.level;
                if (s.level > highestLevel) highestLevel = s.level;
            }
        });
        return { totalLevel, highestLevel, skills: liveSkills, theme: activeTheme };
    }

    const key = getStorageKey(id);
    let saved = localStorage.getItem(key);
    if (!saved && id === 1) saved = localStorage.getItem('heroSkills_v23');
    if (!saved) return null;
    try {
        const data = JSON.parse(saved);
        const skillsData = data.skills || data;
        const theme = data.theme || 'minecraft';
        let totalLevel = 0;
        let highestLevel = 0;
        Object.values(skillsData).forEach(s => {
            if (s && typeof s.level === 'number') {
                totalLevel += s.level;
                if (s.level > highestLevel) highestLevel = s.level;
            }
        });
        return { totalLevel, highestLevel, skills: skillsData, theme };
    } catch (e) {
        console.warn('Failed to parse profile stats:', e);
        return null;
    }
};

/**
 * Saves everything consistently to local storage
 */
export const saveGameState = (currentProfile, skills, activeTheme, stats, profileNames, parentStatus, language) => {
    const dataToSave = { skills, theme: activeTheme, stats };
    localStorage.setItem(getStorageKey(currentProfile), JSON.stringify(dataToSave));
    localStorage.setItem('currentProfile_v1', currentProfile.toString());
    localStorage.setItem('heroProfileNames_v1', JSON.stringify(profileNames));
    localStorage.setItem('heroParentStatus_v1', JSON.stringify(parentStatus));
    localStorage.setItem('heroLanguage_v1', language);
};

export const saveCosmetics = (currentProfile, selectedBorder, borderColor) => {
    localStorage.setItem(`borderEffect_p${currentProfile}`, selectedBorder);
    localStorage.setItem(`borderColor_p${currentProfile}`, borderColor);
};

export const loadCosmetics = (currentProfile) => {
    return {
        selectedBorder: localStorage.getItem(`borderEffect_p${currentProfile}`) || 'solid',
        borderColor: localStorage.getItem(`borderColor_p${currentProfile}`) || '#FFD700'
    };
};
