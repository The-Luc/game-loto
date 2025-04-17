'use client';

import { useGameStore } from '@/stores/useGameStore';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

export function VictoryScreen() {
  const winner = useGameStore((state) => state.winner);
  const winnerNickname = winner?.nickname || '';

  const [showConfetti, setShowConfetti] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (winner) {
      setOpen(true);
      setShowConfetti(true);
    } else {
      setOpen(false);
    }
  }, [winner]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (open && showConfetti) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1300 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          setShowConfetti(false);
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      confetti.reset();
    };
  }, [open, showConfetti]);

  if (!open || !winnerNickname) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-green-600">🎉 Victory! 🎉</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-lg">
            Congratulations, <span className="font-semibold">{winnerNickname}</span>! You won the game!
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
