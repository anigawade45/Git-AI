import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SecurityAnalysis() {
  const checks = [
    { title: 'JWT Token Signing & Secret Key Security', passed: true },
    { title: 'Bcrypt Password Hashing & Salt Rounds', passed: true },
    { title: 'Hardcoded Secret Detection', passed: false, detail: 'Hardcoded password in src/config/database.js' },
    { title: 'Authentication Route Rate Limiting', passed: false, detail: 'Missing rate limiter on POST /api/auth/login' },
    { title: 'CORS & Security Headers Configuration', passed: true },
    { title: 'Dependencies Vulnerability Scan (npm audit)', passed: true },
  ];

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Security Audit Checklist</span>
          </span>
          <span className="text-xs font-mono font-bold text-emerald-500">Score: 90%</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-3">
        {checks.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
              item.passed
                ? 'bg-emerald-500/10 border-emerald-500/20 text-foreground'
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            {item.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="font-semibold">{item.title}</p>
              {item.detail && <p className="text-[11px] opacity-80 font-mono">{item.detail}</p>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
