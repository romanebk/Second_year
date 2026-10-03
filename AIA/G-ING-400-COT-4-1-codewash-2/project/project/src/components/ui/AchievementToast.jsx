import React from 'react';
import { Trophy } from 'lucide-react';
import { ACHIEVEMENTS, TIER_COLORS, TIER_NAMES } from '../../constants/achievements';
import { getTranslation } from '../../utils/i18n';

/**
 * AchievementToast Component
 * Displays a celebratory toast when an achievement is unlocked
 */
const AchievementToast = ({ achievementId, tierIndex = null, language = 'en' }) => {
    const achievement = ACHIEVEMENTS[achievementId];
    
    if (!achievement) return null;
    
    // Determine display values
    let displayName = getTranslation('ach_name_' + achievementId, language);
    let tierColor = null;
    let tierName = null;
    
    if (achievement.isTiered && tierIndex !== null && tierIndex >= 0) {
        const tierKey = TIER_NAMES[tierIndex].toLowerCase();
        
        // Wait, for skill_mastery it's more complex. Let's simplify and use the tier name logic
        let tierDisplayName = getTranslation('tier_' + tierKey, language);
        let achPartName = "";
        
        if (achievementId === 'phantom_hunter') achPartName = getTranslation('ach_tier_ghost_buster', language);
        else if (achievementId === 'combined_levels') achPartName = getTranslation('ach_tier_power', language);
        else if (achievementId === 'skill_mastery') {
            const masteryTitles = ['apprentice', 'journeyman', 'adept', 'expert', 'master', 'grandmaster', 'sage', 'transcendent'];
            achPartName = getTranslation('ach_tier_' + masteryTitles[tierIndex], language);
            // In skill mastery, the tier name IS the title (e.g. Bronze Apprentice -> Bronze is prefix, Apprentice is part)
        }
        
        displayName = `${tierDisplayName} ${achPartName}`.trim();
        tierColor = TIER_COLORS[tierIndex + 1];
        tierName = tierDisplayName;
    }
    
    const Icon = achievement.icon;
    const borderColor = tierColor ? tierColor.border : '#FFD700';
    const bgColor = tierColor ? tierColor.bg : 'rgba(255, 215, 0, 0.1)';
    
    return (
        <div 
            className="fixed bottom-8 left-1/2 z-50 animate-achievement-toast w-full max-w-2xl pointer-events-none transform -translate-x-1/2"
        >
            <div 
                className="bg-black/90 rounded-xl p-4 px-8 flex items-center justify-between backdrop-blur-md mx-4"
                style={{
                    border: `4px solid ${borderColor}`,
                    boxShadow: `0 0 30px ${borderColor}80, 0 0 50px ${borderColor}40`
                }}
            >
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div 
                        className="p-3 rounded-full border-2 animate-bounce"
                        style={{
                            borderColor: borderColor,
                            backgroundColor: bgColor
                        }}
                    >
                        <Icon size={32} className="text-yellow-300" />
                    </div>
                    
                    {/* Text */}
                    <div className="text-left">
                        <h2 className="text-2xl text-yellow-400 font-bold leading-none mb-1 uppercase tracking-wide">
                            {getTranslation('achievement_unlocked', language)}
                        </h2>
                        <p className="text-white text-lg font-bold">
                            {displayName}
                        </p>
                        {tierName && (
                            <p className="text-stone-400 text-sm mt-1">
                                {tierName} {getTranslation('tier_suffix', language)}
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Trophy Icon */}
                <div className="pl-6 border-l-2 border-stone-600">
                    <Trophy 
                        size={48} 
                        className="text-yellow-400 animate-pulse"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AchievementToast;
