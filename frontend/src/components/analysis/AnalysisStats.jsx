import React from 'react';
import { FileCode, Cpu, AlertTriangle, ShieldAlert, GitCommit } from 'lucide-react';

export default function AnalysisStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="p-3 rounded-xl bg-card/60 border border-border/60 backdrop-blur flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <FileCode className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Files</p>
          <p className="text-sm font-extrabold font-mono text-foreground">{stats.files || 0}</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-card/60 border border-border/60 backdrop-blur flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Functions</p>
          <p className="text-sm font-extrabold font-mono text-foreground">{stats.functions || 0}</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-card/60 border border-border/60 backdrop-blur flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Issues</p>
          <p className="text-sm font-extrabold font-mono text-foreground">{stats.issues || 0}</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-card/60 border border-border/60 backdrop-blur flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Security Risks</p>
          <p className="text-sm font-extrabold font-mono text-foreground text-destructive">{stats.securityIssues || 0}</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-card/60 border border-border/60 backdrop-blur flex items-center gap-3 col-span-2 sm:col-span-1">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <GitCommit className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Commits</p>
          <p className="text-sm font-extrabold font-mono text-foreground">{stats.commits || 0}</p>
        </div>
      </div>
    </div>
  );
}
