import { TRANSLATIONS } from '../constants/translations';

export const getTranslation = (key, lang = 'en') => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
};
