import React from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ formatTime, timeRemaining }) => {
  const isCritical = timeRemaining < 60;

  return (
    <div
      className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg border transition-all duration-300 ${
        isCritical
          ? 'bg-danger/10 border-danger text-danger timer-danger-pulse'
          : 'bg-charcoal-surface border-accent/25 text-accent'
      }`}
    >
      <Clock className={`h-4.5 w-4.5 ${isCritical ? 'animate-spin' : ''}`} />
      <div className="flex flex-col">
        <span className="text-[9px] text-softgrey uppercase tracking-wider leading-none">
          Time Remaining
        </span>
        <span className="text-lg font-mono font-bold leading-none mt-1">
          {formatTime()}
        </span>
      </div>
    </div>
  );
};

export default Timer;
