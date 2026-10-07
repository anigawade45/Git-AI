import React from 'react';

export default function DocumentationScope({ scope, onChange }) {
  const options = [
    { id: 'Entire Repository', label: 'Entire Repository', desc: 'Scan all folders, controllers, routes, and models' },
    { id: 'Specific Folder', label: 'Specific Folder (src/)', desc: 'Target core source folder only' },
    { id: 'Controllers & Routes', label: 'Controllers & Routes', desc: 'Focus on API endpoints and request handlers' },
  ];

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Scope</label>
      <select
        value={scope}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-xl border border-border/80 bg-card text-foreground font-mono text-xs focus:outline-none focus:border-primary cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label} — {opt.desc}
          </option>
        ))}
      </select>
    </div>
  );
}
