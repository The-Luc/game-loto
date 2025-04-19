'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoToCard } from "./LoToCard";
import { LoToCardType } from "@/lib/types";
import { useEffect } from "react";

interface WinModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  winnerName: string;
  winningCard: LoToCardType;
  winningRowIndex: number;
  onPlayAgain?: () => void;
}

export function WinModal({ 
  isOpen, 
  onCloseAction, 
  winnerName, 
  winningCard, 
  winningRowIndex,
  onPlayAgain
}: WinModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            🎉 Chúc mừng {winnerName}! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <p className="text-center mb-4">Đã hoàn thành một hàng!</p>
          
          <div className="w-full max-w-xs">
            <LoToCard 
              card={winningCard} 
              playable={false}
              highlightedRowIndex={winningRowIndex}
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-center space-x-2">
          {onPlayAgain && (
            <Button onClick={onPlayAgain} variant="default">Chơi lại</Button>
          )}
          <Button onClick={onCloseAction} variant={onPlayAgain ? "outline" : "default"}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
