import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCode, ExternalLink } from 'lucide-react';

export default function SourceReference({
  fileName,
  filePath,
  startLine,
  endLine,
  score,
  retrievalMethod,
  repoId,
}) {
  const navigate = useNavigate();

  const hasLineRange =
    Number.isFinite(Number(startLine)) &&
    Number.isFinite(Number(endLine));

  const displayFileName = fileName || filePath || 'Unknown file';
  const displayFilePath = filePath || 'Path unavailable';
  const formattedScore = typeof score === 'number'
    ? (score >= 0.99 || retrievalMethod === 'manifest'
        ? 'Exact match'
        : `${Math.min(100, Math.max(0, Math.round(score * 100)))}% match`)
    : null;

  const handleClick = () => {
    if (!repoId) return;

    const params = new URLSearchParams();

    if (filePath) {
      params.set('file', filePath);
    }

    if (hasLineRange) {
      params.set('line', String(startLine));
    }

    const query = params.toString();

    navigate(
      `/repository/${encodeURIComponent(repoId)}${query ? `?${query}` : ''}`
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!repoId}
      aria-label={`Open ${displayFilePath}${
        hasLineRange ? ` at line ${startLine}` : ''
      }`}
      className="p-2.5 rounded-xl border border-border/80 bg-card/80 hover:bg-card hover:border-primary/40 transition-all text-left group cursor-pointer flex items-center justify-between gap-3 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
      title={`Open ${displayFilePath} in Code Viewer`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <FileCode className="w-3.5 h-3.5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <p className="text-xs font-bold font-mono text-foreground truncate group-hover:text-primary transition-colors">
              {displayFileName}
            </p>
            {formattedScore && (
              <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 font-mono text-[9px] shrink-0">
                {formattedScore}
              </span>
            )}
          </div>

          <p className="text-[10px] font-mono text-muted-foreground truncate">
            {displayFilePath}
            {hasLineRange
              ? ` (Lines ${startLine}–${endLine})`
              : ''}
          </p>
        </div>
      </div>

      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </button>
  );
}

