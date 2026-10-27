import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface InterviewTimerProps {
  expiresAt: string;
  totalDurationMinutes: number;
  onExpire: () => void;
}

export const InterviewTimer: React.FC<InterviewTimerProps> = ({
  expiresAt,
  totalDurationMinutes,
  onExpire,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    return diff;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalSeconds = totalDurationMinutes * 60;
  const percentRemaining = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  const isUrgent = secondsLeft <= 3 * 60;
  const isWarning = secondsLeft <= 10 * 60;

  return (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 shadow-subtle">
      <div className="flex items-center gap-2">
        <Clock
          className={`w-4 h-4 ${
            isUrgent
              ? 'text-rose-400 animate-pulse'
              : isWarning
              ? 'text-amber-400'
              : 'text-brand-400'
          }`}
        />
        <span
          className={`font-mono text-sm font-bold tracking-wider ${
            isUrgent
              ? 'text-rose-400 animate-pulse'
              : isWarning
              ? 'text-amber-300'
              : 'text-slate-100'
          }`}
        >
          {formattedTime}
        </span>
      </div>

      {/* Mini Progress Bar */}
      <div className="hidden sm:block w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 rounded-full ${
            isUrgent ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>

      {isUrgent && (
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-rose-300">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          Expiring soon
        </span>
      )}
    </div>
  );
};
