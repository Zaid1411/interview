import React from 'react';

interface LanguageSelectorProps {
  language: 'javascript' | 'python';
  onChange: (newLang: 'javascript' | 'python') => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-1 bg-[#1e293b] p-1 rounded-lg border border-slate-700/80">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('javascript')}
        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
          language === 'javascript'
            ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        JavaScript (Node 18)
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('python')}
        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
          language === 'python'
            ? 'bg-slate-800 text-sky-400 shadow-sm border border-slate-700'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Python (3.10)
      </button>
    </div>
  );
};
