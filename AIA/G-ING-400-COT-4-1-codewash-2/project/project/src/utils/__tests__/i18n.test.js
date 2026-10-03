import { describe, it, expect, vi } from 'vitest';
import { getTranslation } from '../i18n';

// Mock the translations constant
vi.mock('../../constants/translations', () => ({
    TRANSLATIONS: {
        en: {
            test_key: 'Test Value',
            fallback_key: 'Fallback Value EN'
        },
        fr: {
            test_key: 'Valeur de Test'
        }
    }
}));

describe('getTranslation', () => {
    it('returns translation in requested language', () => {
        expect(getTranslation('test_key', 'fr')).toBe('Valeur de Test');
        expect(getTranslation('test_key', 'en')).toBe('Test Value');
    });

    it('falls back to English if key is missing in requested language', () => {
        expect(getTranslation('fallback_key', 'fr')).toBe('Fallback Value EN');
    });

    it('returns the key itself if missing in both languages', () => {
        expect(getTranslation('missing_key', 'fr')).toBe('missing_key');
    });

    it('defaults to English if no language is provided', () => {
        expect(getTranslation('test_key')).toBe('Test Value');
    });
});
