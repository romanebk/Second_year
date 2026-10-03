import { getTranslation } from './i18n';

// Available aura types
const AURA_TYPES = ['rainbow', 'frost', 'shadow', 'lava', 'gradient', 'sparkle', 'plasma', 'nature'];

/**
 * Get localized aura adjective
 * @param {string} aura - Aura type
 * @param {string} language - Language code
 * @returns {string} Localized adjective
 */
export const getAuraAdjective = (aura, language = 'en') => {
    return getTranslation(`aura_${aura}`, language);
};

/**
 * Get a random aura effect
 * @returns {string} Random aura type from AURA_TYPES
 */
export const getRandomAura = () => {
    return AURA_TYPES[Math.floor(Math.random() * AURA_TYPES.length)];
};

/**
 * Generate mob with aura for display
 * @param {string} mobName - Name of the mob
 * @param {string} mobSrc - Source path for mob image
 * @param {string} language - Current language
 * @returns {object} Object with mobName, mobSrc, aura, and displayName
 */
export const generateMobWithAura = (mobName, mobSrc, language = 'en') => {
    const aura = getRandomAura();
    const adjective = getAuraAdjective(aura, language);
    const displayName = adjective ? `${adjective} ${mobName}` : mobName;
    
    return {
        mobName,
        mobSrc,
        aura,
        displayName
    };
};
