'use client';

import { useState, useEffect } from 'react';
import { LoToCard } from '@/components/LoToCard';
import { cardTemplates } from '../lib/card-template';
import { useGameStore } from '@/stores/useGameStore';
import { Button } from '@/components/ui/button';

import { updateRoomStatusAction } from '@/server/actions/room';

// Card item component to separate rendering logic from the main component
type SelectableCardProps = {
  card: { id: string };
  isSelected: boolean;
  isSelectedByOther: boolean;
  playerName: string;
  selectable: boolean;
};

const SelectableCard = ({ card, isSelected, isSelectedByOther, playerName, selectable }: SelectableCardProps) => {
  const isCardSelected = isSelected || isSelectedByOther;
  
  return (
    <div className={`
      relative rounded-lg transition-all duration-300 
      ${isSelected ? 'ring-4 ring-blue-500 scale-105' : ''}
      ${isSelectedByOther ? 'opacity-50' : ''}
    `}>
      <LoToCard cardId={card.id} selectable={selectable} />
      
      {isCardSelected && playerName && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50  rounded-lg">
          <div className="bg-red-400 text-white px-10 py-2 rounded-md text-lg  border-2 border-white">
            {playerName}
          </div>
        </div>
      )}
    </div>
  );
};

export function CardSelection() {
  const { player, room, playersInRoom, setRoom } = useGameStore();
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);

  // Function to find which player selected a specific card
  // if is current player, return 'Thẻ của bạn'
  const findPlayerName = (cardId: string) => {
    const p = playersInRoom?.find(p => p.cardId === cardId);
    return p?.id === player?.id ? 'Thẻ của bạn' : p?.nickname || 'Không biết';
  };


  useEffect(() => {
    if (player) {
      setSelectedCardId(player.cardId || '');
      setIsHost(player.isHost);
    }
  }, [player]);

  useEffect(() => {
    if (playersInRoom && playersInRoom.length > 0) {
      // Check if all players have selected a card
      const allSelected = playersInRoom.every(p => p.cardId && p.cardId !== '');
      setAllPlayersReady(allSelected);
    }
  }, [playersInRoom]);

  const startGame = async () => {
    if (!room) return;
    
    try {
      const response = await updateRoomStatusAction(room.id, 'playing');
      
      if (response.success) {
        // Update the local room state
        setRoom({
          ...room,
          status: 'playing'
        });
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">Chọn bảng của bạn</h2>
        <p className="text-center text-gray-600 mb-6">
          Chọn một trong những bảng sau để chơi.
        </p>
        
        {isHost && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Bạn là chủ xị</h3>
            <p className="text-sm text-blue-600 mb-3">
              Bạn có thể bắt đầu trò chơi khi tất cả các người chơi đã chọn một bảng.
            </p>
            <Button 
              onClick={startGame} 
              disabled={!allPlayersReady}
              className="w-full sm:w-auto"
            >
              {allPlayersReady ? 'Bắt đầu trò chơi' : 'Đang chờ tất cả các người chơi chọn bảng...'}
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cardTemplates.map(card => {
            const isSelected = selectedCardId === card.id;
            const isSelectedByOther = !isSelected && playersInRoom?.some(p => p.cardId === card.id);
            const name = findPlayerName(card.id);
            
            return (
              <SelectableCard
                key={card.id}
                card={card}
                isSelected={isSelected}
                isSelectedByOther={isSelectedByOther}
                playerName={name}
                selectable={!isSelectedByOther}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
