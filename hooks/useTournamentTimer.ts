
import { useState, useEffect } from 'react';
import { Tournament, TournamentStructure } from '../types';

export interface TournamentTimerState {
    currentTime: Date;
    timeRemaining: number; // Seconds
    currentLevelIndex: number;
    isBreak: boolean;
    isFinished: boolean;
    hasStarted: boolean;
}

export const useTournamentTimer = (
    tournament: Tournament | null, 
    structure: TournamentStructure | null
): TournamentTimerState => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [isBreak, setIsBreak] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!tournament) return;

        const calculateState = () => {
            const now = new Date();
            setCurrentTime(now);

            if (!tournament.startDate || !tournament.startTime) {
                setTimeRemaining(0);
                return;
            }

            // Parse Start Time safely
            // Note: In a real app, ensure timezones are handled. Here we assume local string matches system local.
            const start = new Date(`${tournament.startDate}T${tournament.startTime}`);
            const elapsedSeconds = (now.getTime() - start.getTime()) / 1000;

            // 1. Pre-Start State
            if (elapsedSeconds < 0) {
                setHasStarted(false);
                // Show duration of the first level
                if (structure && structure.items.length > 0) {
                    setTimeRemaining(structure.items[0].duration * 60);
                } else {
                    setTimeRemaining((tournament.blindLevelMinutes || 20) * 60);
                }
                setCurrentLevelIndex(0);
                setIsBreak(false);
                setIsFinished(false);
                return;
            }

            setHasStarted(true);

            // 2. Structure-based Calculation
            if (structure && structure.items.length > 0) {
                let tempElapsed = elapsedSeconds;
                let foundLevel = false;

                for (let i = 0; i < structure.items.length; i++) {
                    const item = structure.items[i];
                    const itemDurationSec = item.duration * 60;

                    if (tempElapsed < itemDurationSec) {
                        // Found the current level
                        setTimeRemaining(Math.max(0, Math.floor(itemDurationSec - tempElapsed)));
                        setCurrentLevelIndex(i);
                        setIsBreak(item.type === 'Break');
                        setIsFinished(false);
                        foundLevel = true;
                        break;
                    } else {
                        // Subtract this level's duration and check the next
                        tempElapsed -= itemDurationSec;
                    }
                }

                // If we went through all items and still have elapsed time -> Tournament Finished
                if (!foundLevel) {
                    setTimeRemaining(0);
                    setCurrentLevelIndex(structure.items.length - 1); // Stay on last known level data
                    setIsFinished(true);
                    setIsBreak(false);
                }
            } 
            // 3. Fallback: Fixed Duration Levels (No Structure)
            else {
                const durationSec = (tournament.blindLevelMinutes || 20) * 60;
                if (durationSec > 0) {
                    const levelIdx = Math.floor(elapsedSeconds / durationSec);
                    const secondsIntoLevel = elapsedSeconds % durationSec;
                    
                    setTimeRemaining(Math.floor(durationSec - secondsIntoLevel));
                    setCurrentLevelIndex(levelIdx);
                    setIsBreak(false);
                    setIsFinished(false);
                } else {
                    setTimeRemaining(0);
                }
            }
        };

        // Run immediately
        calculateState();

        // Start Loop
        const timer = setInterval(calculateState, 1000);

        return () => clearInterval(timer);
    }, [tournament, structure]);

    return {
        currentTime,
        timeRemaining,
        currentLevelIndex,
        isBreak,
        isFinished,
        hasStarted
    };
};
