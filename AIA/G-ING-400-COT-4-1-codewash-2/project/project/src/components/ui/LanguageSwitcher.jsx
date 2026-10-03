import React from 'react';
import { Globe } from 'lucide-react';
import { playClick } from '../../utils/soundManager';
import { getTranslation } from '../../utils/i18n';

const LanguageSwitcher = ({ currentLang, onLanguageChange }) => {
    const languages = [
        { id: 'en', name: 'English', flag: '🇺🇸' },
        { id: 'fr', name: 'Français', flag: '🇫🇷' }
    ];

    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-xl text-blue-300 mb-2 font-bold flex items-center gap-3 uppercase tracking-wider">
                <Globe size={20} /> {getTranslation('language_label', currentLang)}
            </h3>
            <div className="flex gap-2">
                {languages.map(lang => (
                    <button
                        key={lang.id}
                        onClick={() => {
                            onLanguageChange(lang.id);
                            playClick();
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 ${currentLang === lang.id
                                ? 'bg-blue-600/30 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                : 'bg-slate-800/70 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white'
                            }`}
                    >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-bold uppercase tracking-wider text-sm">{lang.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
