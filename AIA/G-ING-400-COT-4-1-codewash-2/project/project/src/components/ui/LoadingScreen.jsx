import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { BASE_ASSETS, SKILL_DATA } from '../../constants/gameData';
import { getTranslation } from '../../utils/i18n';

const LoadingScreen = ({ onComplete, language = 'en' }) => {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState(getTranslation('loading_init', language));

    useEffect(() => {
        const assetsToLoad = [
            ...Object.values(BASE_ASSETS.skillIcons),
            ...Object.values(BASE_ASSETS.badges),
            ...Object.values(BASE_ASSETS.axolotls),
        ];

        let loadedCount = 0;
        const totalAssets = assetsToLoad.length;

        const loadAsset = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = resolve;
                img.onerror = resolve;
            });
        };

        const loadAll = async () => {
            for (const asset of assetsToLoad) {
                await loadAsset(asset);
                loadedCount++;
                const newProgress = Math.round((loadedCount / totalAssets) * 100);
                setProgress(newProgress);

                if (newProgress < 30) setStatusText(getTranslation('loading_bits', language));
                else if (newProgress < 60) setStatusText(getTranslation('loading_flux', language));
                else if (newProgress < 90) setStatusText(getTranslation('loading_bugs', language));
                else setStatusText(getTranslation('loading_final', language));
            }

            // Artificial delay for smooth transition if it was too fast
            setTimeout(() => {
                onComplete();
            }, 500);
        };

        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#0f172a] flex flex-col items-center justify-center font-sans">
            <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                {/* Outer Glow */}
                <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>

                {/* Rotating Ring */}
                <div className="absolute inset-0 border-t-4 border-blue-400 rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-r-4 border-purple-400 rounded-full animate-spin-slow"></div>

                {/* Logo / Icon Area */}
                <div className="z-10 bg-slate-900 shadow-2xl rounded-full p-8 border-2 border-slate-700">
                    <Sparkles size={64} className="text-yellow-400 animate-bounce" />
                </div>
            </div>

            <div className="w-80 space-y-4 text-center">
                <h1 className="text-4xl font-bold text-white tracking-widest uppercase" style={{ fontFamily: '"VT323", monospace' }}>
                    CodeWash <span className="text-blue-400">Inc.</span>
                </h1>

                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                        className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="flex justify-between text-xs font-mono uppercase tracking-tighter">
                    <span className="text-slate-400">{statusText}</span>
                    <span className="text-blue-400 font-bold">{progress}%</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}} />
        </div>
    );
};

export default LoadingScreen;
