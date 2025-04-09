'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface VictoryScreenProps {
  winner: string;
}

export function VictoryScreen({ winner }: VictoryScreenProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const { gameState } = useGame();
  const [open, setOpen] = useState(false);
  console.log('🚀 ~ VictoryScreen ~ open:', open);

  useEffect(() => {
    if (!winner) return;
    setOpen(true);
  }, [winner]);

  // Trigger confetti effect when component mounts
  useEffect(() => {
    if (showConfetti && winner) {
      // Create a confetti cannon
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          setShowConfetti(false);
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Launch confetti from both sides
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

      return () => clearInterval(interval);
    }
  }, [showConfetti, winner]);

  const isWinner = winner === 'You' || winner === gameState.player?.nickname;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="shadow-lg md:w-[600px]">
        {/* <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"> */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-yellow-500">
            {isWinner ? '🏆 You Won! 🏆' : `${winner} Won!`}
          </h2>

          <div className="mb-8">
            {isWinner ? (
              <p className="text-xl">
                Congratulations! You&apos;ve completed a row and won the game!
              </p>
            ) : (
              <p className="text-xl">{winner} has completed a row and won the game!</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-center! ">
          <Button
            onClick={() => setOpen(false)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2 text-lg"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
