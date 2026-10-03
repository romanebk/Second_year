import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuraAdjective, getRandomAura, generateMobWithAura } from '../mobDisplayUtils';

// Mock the i18n utility
vi.mock('../i18n', () => ({
    getTranslation: (key, lang) => {
        if (lang === 'fr' && key === 'aura_shadow') return 'Sombre';
        if (key === 'aura_rainbow') return 'Rainbow';
        return key;
    }
}));

describe('mobDisplayUtils', () => {
    let mathRandomSpy;

    beforeEach(() => {
        // Mock Math.random to always return 0 (first element of AURA_TYPES array: 'rainbow')
        mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    });

    afterEach(() => {
        mathRandomSpy.mockRestore();
    });

    describe('getAuraAdjective', () => {
        it('returns localized adjective based on aura type', () => {
            expect(getAuraAdjective('shadow', 'fr')).toBe('Sombre');
            expect(getAuraAdjective('rainbow', 'en')).toBe('Rainbow');
        });
    });

    describe('getRandomAura', () => {
        it('returns a valid aura type from the list', () => {
            // Because Math.random returns 0, it should return the first aura type 'rainbow'
            expect(getRandomAura()).toBe('rainbow');

            // Test max index (which translates to the last element: 'nature')
            mathRandomSpy.mockReturnValue(0.99);
            expect(getRandomAura()).toBe('nature');
        });
    });

    describe('generateMobWithAura', () => {
        it('generates a mob object with aura attributes and displayName', () => {
            // Math.random is mocked to 0 -> aura 'rainbow' -> adj 'Rainbow'
            const result = generateMobWithAura('Zombie', '/path/zombie.png', 'en');
            
            expect(result).toEqual({
                mobName: 'Zombie',
                mobSrc: '/path/zombie.png',
                aura: 'rainbow',
                displayName: 'Rainbow Zombie'
            });
        });
    });
});
