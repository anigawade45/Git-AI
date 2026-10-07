import React from 'react';

export default function DocumentationLanguage({ language, onChange }) {
  const languages = ['English', 'Hindi', 'Marathi', 'Spanish', 'French', 'German'];

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Output Language</label>
      <select
        value={language}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-xl border border-border/80 bg-card text-foreground font-mono text-xs focus:outline-none focus:border-primary cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
}
