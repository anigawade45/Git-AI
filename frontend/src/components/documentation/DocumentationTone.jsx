import React from 'react';

export default function DocumentationTone({ tone, onChange }) {
  const tones = [
    { id: 'Professional', label: 'Professional (Standard)' },
    { id: 'Technical', label: 'Deep Technical (Engineering)' },
    { id: 'Beginner Friendly', label: 'Beginner Friendly (Tutorial Style)' },
    { id: 'Concise', label: 'Concise (Short Summary)' },
  ];

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tone & Style</label>
      <select
        value={tone}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-xl border border-border/80 bg-card text-foreground font-mono text-xs focus:outline-none focus:border-primary cursor-pointer"
      >
        {tones.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
