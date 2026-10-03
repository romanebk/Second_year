import { describe, it, expect, vi } from 'vitest';
import { 
    getDefaultStats, 
    addUniqueToArray, 
    recordLoginDate 
} from '../achievementUtils';

// Mock the Date object to ensure consistent testing
const mockDate = new Date('2026-03-20T12:00:00Z');
vi.setSystemTime(mockDate);

describe('achievementUtils', () => {
    describe('getDefaultStats', () => {
        it('returns an object with all default stats initialized to zero or empty arrays', () => {
            const stats = getDefaultStats();
            expect(stats.phantomsCaught).toBe(0);
            expect(stats.totalMobsDefeated).toBe(0);
            expect(stats.uniqueMobsDefeated).toEqual([]);
            expect(stats.achievementsUnlocked).toEqual([]);
        });
    });

    describe('addUniqueToArray', () => {
        it('adds a new value to the array if it does not exist', () => {
            const arr = ['Zombie', 'Skeleton'];
            const newArr = addUniqueToArray(arr, 'Creeper');
            expect(newArr).toEqual(['Zombie', 'Skeleton', 'Creeper']);
        });

        it('does not add the value if it already exists in the array', () => {
            const arr = ['Zombie', 'Skeleton'];
            const newArr = addUniqueToArray(arr, 'Zombie');
            expect(newArr).toEqual(['Zombie', 'Skeleton']);
            // Should be the exact same array length and content
            expect(newArr.length).toBe(2);
        });
    });

    describe('recordLoginDate', () => {
        it('adds today date if not present', () => {
            const dates = ['2026-03-18', '2026-03-19'];
            const newDates = recordLoginDate(dates);
            expect(newDates.includes('2026-03-20')).toBe(true);
            expect(newDates.length).toBe(3);
        });

        it('does not duplicate the date if already logged in today', () => {
            const dates = ['2026-03-19', '2026-03-20'];
            const newDates = recordLoginDate(dates);
            expect(newDates).toEqual(['2026-03-19', '2026-03-20']);
            expect(newDates.length).toBe(2);
        });
    });
});
