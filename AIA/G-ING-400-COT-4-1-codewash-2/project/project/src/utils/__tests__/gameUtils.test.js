import { describe, it, expect } from 'vitest';
import { 
    getDifficultyMultiplier, 
    calculateDamage, 
    calculateMobHealth, 
    getExpectedDifficulty 
} from '../gameUtils';

describe('gameUtils progression logic', () => {
    it('calculates correct difficulty multiplier', () => {
        expect(getDifficultyMultiplier(1)).toBe(1); // 3^0
        expect(getDifficultyMultiplier(2)).toBe(3); // 3^1
        expect(getDifficultyMultiplier(3)).toBe(9); // 3^2
    });

    it('calculates damage consistently across difficulties', () => {
        // Base damage is 12. D1 = 12 * 1, D2 = 12 * 3
        expect(calculateDamage(1, 1)).toBe(12);
        expect(calculateDamage(10, 2)).toBe(36);
        expect(calculateDamage(25, 3)).toBe(108);
    });

    it('calculates mob health for consistent 5-hit battles', () => {
        // Base Health is 60. D1 = 60 * 1, D2 = 60 * 3
        expect(calculateMobHealth(1)).toBe(60);
        expect(calculateMobHealth(2)).toBe(180);
        expect(calculateMobHealth(3)).toBe(540);
        
        // Ensure 5 hits exactly
        expect(calculateMobHealth(2) / calculateDamage(10, 2)).toBe(5);
        expect(calculateMobHealth(3) / calculateDamage(25, 3)).toBe(5);
    });

    it('determines expected difficulty from player level', () => {
        expect(getExpectedDifficulty(1)).toBe(1);
        expect(getExpectedDifficulty(20)).toBe(1);
        expect(getExpectedDifficulty(21)).toBe(2);
        expect(getExpectedDifficulty(40)).toBe(2);
        expect(getExpectedDifficulty(41)).toBe(3);
    });
});
