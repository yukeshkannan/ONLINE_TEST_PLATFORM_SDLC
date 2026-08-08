import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialSeconds, onTimeUp) => {
  const duration = Number(initialSeconds) > 0 ? Number(initialSeconds) : 1800;
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(true);
  const onTimeUpRef = useRef(onTimeUp);
  const hasInitialized = useRef(false);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (Number(initialSeconds) > 0 && !hasInitialized.current) {
      setTimeRemaining(Number(initialSeconds));
      hasInitialized.current = true;
    }
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive || !hasInitialized.current) return;

    if (timeRemaining <= 0) {
      if (onTimeUpRef.current) {
        onTimeUpRef.current();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          if (onTimeUpRef.current) {
            onTimeUpRef.current();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, timeRemaining]);

  const formatTime = () => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pause = () => setIsActive(false);
  const resume = () => setIsActive(true);
  const reset = (newSeconds) => {
    setTimeRemaining(newSeconds);
    setIsActive(true);
  };

  return {
    timeRemaining,
    isActive,
    formatTime,
    isTimeUp: timeRemaining <= 0,
    pause,
    resume,
    reset,
    setTimeRemaining
  };
};

export default useTimer;

