import React, { useState } from 'react';
import { Bug, X, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { getTranslation } from '../../utils/i18n';

const BUG_CATEGORIES = [
    { id: 'visual', icon: '🖼' },
    { id: 'gameplay', icon: '🎮' },
    { id: 'audio', icon: '🔊' },
    { id: 'performance', icon: '⚡' },
    { id: 'other', icon: '📝' }
];

const BugReportModal = ({ isOpen, onClose, language = 'en' }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('gameplay');
    const [severity, setSeverity] = useState('medium');
    const [submitted, setSubmitted] = useState(false);
    const [reports, setReports] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('bug_reports') || '[]');
        } catch { return []; }
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        const newReport = {
            id: Date.now(),
            title: title.trim(),
            description: description.trim(),
            category,
            severity,
            timestamp: new Date().toISOString(),
            status: 'open'
        };

        const updated = [...reports, newReport];
        setReports(updated);
        localStorage.setItem('bug_reports', JSON.stringify(updated));

        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setTitle('');
            setDescription('');
            setCategory('gameplay');
            setSeverity('medium');
        }, 2000);
    };

    const handleDeleteReport = (id) => {
        const updated = reports.filter(r => r.id !== id);
        setReports(updated);
        localStorage.setItem('bug_reports', JSON.stringify(updated));
    };

    const severityColors = {
        low: 'bg-green-500/20 border-green-500/50 text-green-400',
        medium: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
        high: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
        critical: 'bg-red-500/20 border-red-500/50 text-red-400'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.3)]"
                 style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl text-red-400 font-bold flex items-center gap-3 uppercase tracking-widest" style={{ fontFamily: '"VT323", monospace' }}>
                        <Bug size={24} /> {getTranslation('discovered_bug', language)}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Success overlay */}
                {submitted ? (
                    <div className="p-12 text-center space-y-4 flex-1 flex flex-col items-center justify-center">
                        <CheckCircle size={64} className="text-green-400 animate-bounce" />
                        <p className="text-2xl text-green-400 font-bold" style={{ fontFamily: '"VT323", monospace' }}>
                            {getTranslation('bug_report_sent', language)}
                        </p>
                        <p className="text-slate-400 text-sm">
                            {getTranslation('bug_report_thanks', language)}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 p-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Title */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-1 uppercase tracking-wider font-semibold">
                                    {getTranslation('bug_title', language)}
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={getTranslation('bug_title_placeholder', language)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none transition-colors"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wider font-semibold">
                                    {getTranslation('bug_category', language)}
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {BUG_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`p-2 rounded-lg border text-center text-xs transition-all ${
                                                category === cat.id
                                                    ? 'bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                        >
                                            <span className="text-lg block">{cat.icon}</span>
                                            <span className="mt-1 block">{getTranslation(`bug_cat_${cat.id}`, language)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Severity */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wider font-semibold">
                                    {getTranslation('bug_severity', language)}
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['low', 'medium', 'high', 'critical'].map(sev => (
                                        <button
                                            key={sev}
                                            type="button"
                                            onClick={() => setSeverity(sev)}
                                            className={`p-2 rounded-lg border text-xs font-semibold transition-all uppercase ${
                                                severity === sev
                                                    ? `${severityColors[sev]} shadow-lg`
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                        >
                                            {getTranslation(`bug_sev_${sev}`, language)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-1 uppercase tracking-wider font-semibold">
                                    {getTranslation('bug_description', language)}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={getTranslation('bug_desc_placeholder', language)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none transition-colors resize-none"
                                    rows={4}
                                    maxLength={500}
                                    required
                                />
                                <p className="text-right text-xs text-slate-500 mt-1">{description.length}/500</p>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!title.trim() || !description.trim()}
                                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <Send size={18} /> {getTranslation('bug_submit', language)}
                            </button>
                        </form>

                        {/* Previous Reports */}
                        {reports.length > 0 && (
                            <div className="border-t border-slate-700 pt-4 mt-4">
                                <h3 className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                                    <AlertTriangle size={14} /> {getTranslation('bug_previous_reports', language)} ({reports.length})
                                </h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                    {reports.slice().reverse().map(report => (
                                        <div key={report.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-semibold truncate">{report.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColors[report.severity]}`}>
                                                        {report.severity}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(report.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteReport(report.id)}
                                                className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BugReportModal;
