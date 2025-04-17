'use client';

import { useState, useEffect } from 'react';
import { LoToCard } from '@/components/LoToCard';
import { cardTemplates } from '../lib/card-template';
import { useGameStore } from '@/stores/useGameStore';
import { Button } from '@/components/ui/button';

import { updateRoomStatusAction } from '@/server/actions/room';

export function CardSelection() {
  const { player, room, playersInRoom, setRoom } = useGameStore();
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);


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
        <h2 className="text-2xl font-bold text-center mb-2">Select Your Card</h2>
        <p className="text-center text-gray-600 mb-6">
          Choose one of the following cards to play with. Each player must select a unique card.
        </p>
        
        {isHost && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Host Controls</h3>
            <p className="text-sm text-blue-600 mb-3">
              As the host, you can start the game once all players have selected their cards.
            </p>
            <Button 
              onClick={startGame} 
              disabled={!allPlayersReady}
              className="w-full sm:w-auto"
            >
              {allPlayersReady ? 'Start Game' : 'Waiting for all players to select cards...'}
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cardTemplates.map(card => {
            const isSelected = selectedCardId === card.id;
            const isSelectedByOther = !isSelected && playersInRoom?.some(p => p.cardId === card.id);
            
            return (
              <div key={card.id} className={`
                relative rounded-lg transition-all duration-300 
                ${isSelected ? 'ring-4 ring-blue-500 scale-105' : ''}
                ${isSelectedByOther ? 'opacity-50' : ''}
              `}>
                <LoToCard cardId={card.id} selectable={!isSelectedByOther} />
                
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                    Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-bold mb-3">Players</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {playersInRoom?.map(p => (
            <div 
              key={p.id} 
              className={`
                p-3 rounded-lg border 
                ${p.cardId ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
                ${p.id === player?.id ? 'border-blue-400' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                <div className="font-medium">
                  {p.nickname} {p.isHost && '(Host)'}
                </div>
                {p.cardId ? (
                  <div className="ml-auto text-xs font-medium text-green-600 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Ready
                  </div>
                ) : (
                  <div className="ml-auto text-xs font-medium text-gray-500 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                    Selecting...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
