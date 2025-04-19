'use client';

import { useEffect, useState, useRef, useCallback } from 'react'; 
import { useGameStore } from '@/stores/useGameStore'; 
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RoomStatus } from '@prisma/client';
import { callNumberAction } from '@/server/actions/room';
import { NumberAnnouncer } from '@/components/NumberAnnouncer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function NumberCaller() {
  // Get state from Zustand store
  const { room, player, calledNumbers, addCalledNumber } = useGameStore();

  // Local state for UI and auto-call functionality
  const [isAutoCallingActive, setIsAutoCallingActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoCallInterval, setAutoCallInterval] = useState<number>(5); // Default 5 seconds
  const [justCalledNumber, setJustCalledNumber] = useState<number | null>(null);
  const autoCallTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isHost = player?.isHost;
  const isPlaying = room?.status === RoomStatus.playing;
  const isEnded = room?.status === RoomStatus.ended;
  const winnerNickname = useGameStore(state => state.winner?.nickname);
  
  // Current called number or null if none
  const currentNumber = calledNumbers.length > 0 ? 
    calledNumbers[calledNumbers.length - 1] : null;
  
  // Format time for display (e.g., 5.0s)
  const formattedInterval = `${autoCallInterval.toFixed(1)}s`;
  
  // Clean up the timer when component unmounts or auto-call is toggled off
  useEffect(() => {
    return () => {
      if (autoCallTimerRef.current) {
        clearInterval(autoCallTimerRef.current);
        autoCallTimerRef.current = null;
      }
    };
  }, []);
  
  // Setup or clear the auto-call timer when its state changes
  useEffect(() => {
    // Clear existing timer if any
    if (autoCallTimerRef.current) {
      clearInterval(autoCallTimerRef.current);
      autoCallTimerRef.current = null;
    }
    
    // Setup new timer if auto-calling is active
    if (isAutoCallingActive && isPlaying && isHost) {
      const intervalMs = autoCallInterval * 1000;
      autoCallTimerRef.current = setInterval(handleCallNext, intervalMs);
    }
    
    // Cleanup function
    return () => {
      if (autoCallTimerRef.current) {
        clearInterval(autoCallTimerRef.current);
        autoCallTimerRef.current = null;
      }
    };
  }, [isAutoCallingActive, autoCallInterval, isPlaying, isHost]);
  
  // Hide component if not playing or no room/player
  if (!room || !player || (!isPlaying && !isEnded)) return null;

  // Handler for calling the next number
  const handleCallNext = async () => {
    // Guard clauses
    if (!isHost || !room || isLoading) return;
    if (room.status !== RoomStatus.playing) return;
    
    try {
      setIsLoading(true);
      
      // Call the server action
      const response = await callNumberAction(room.id);
      
      if (response.success && response.number) {
        // Update local state with the new number
        addCalledNumber(response.number);
        setJustCalledNumber(response.number);
      } else {
        // Handle errors (all 90 numbers called, etc)
        console.error('Failed to call number:', response.error);
        
        // If all numbers have been called, we should handle that case
        if (response.error === 'All numbers have already been called') {
          setIsAutoCallingActive(false);
        }
      }
    } catch (error) {
      console.error('Error calling number:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for toggling auto-call
  const handleToggleAutoCall = () => {
    // Guard clauses
    if (!isHost || !room) return;
    if (room.status !== RoomStatus.playing) return;
    
    const newAutoCallState = !isAutoCallingActive;
    setIsAutoCallingActive(newAutoCallState);
    
    // If turning off, clear the timer
    if (!newAutoCallState && autoCallTimerRef.current) {
      clearInterval(autoCallTimerRef.current);
      autoCallTimerRef.current = null;
    }
  };
  
  // Handler for announcement completion
  const handleAnnouncementComplete = useCallback(() => {
    // After announcement is complete, clear the just called number
    setJustCalledNumber(null);
  }, []);

  // Reset called numbers and game state (placeholder - would use server action in production)
  const handleStartOver = async () => {
    if (!isHost || !room) return;
    
    try {
      setIsLoading(true);
      console.log('Start over functionality will be implemented in a future task');
    } catch (error) {
      console.error('Error starting over:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // --------------------------------------------------

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Number Caller</CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Current or Last Called Number Display */}
        {isPlaying && (
          <div className="space-y-4">
            {currentNumber !== null && (
              <div className="mb-6">
                <p className="text-sm text-center text-muted-foreground mb-1">
                  {calledNumbers.length > 1 ? 'Last Called Number:' : 'First Number:'}
                </p>
                <div className="text-6xl font-bold text-center p-6 bg-primary/10 rounded-lg transition-all duration-300">
                  {currentNumber}
                </div>
                
                {/* Connect the NumberAnnouncer to handle Vietnamese TTS */}
                <NumberAnnouncer 
                  number={justCalledNumber === null ? undefined : justCalledNumber} 
                  onAnnouncementComplete={handleAnnouncementComplete} 
                  autoAnnounce={true} 
                />
              </div>
            )}
            
            {/* Called Numbers History */}
            {calledNumbers.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Called Numbers:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {calledNumbers.map((num, index) => (
                    <span 
                      key={`${num}-${index}`}
                      className={`inline-flex items-center justify-center h-8 w-8 text-sm 
                        ${num === currentNumber ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                        rounded-full font-medium`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Winner display */}
        {isEnded && winnerNickname && (
          <div className="py-6 text-center bg-green-100 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              🎉 Winner: {winnerNickname}! 🎉
            </p>
          </div>
        )}
        
        {/* Host Controls */}
        {isHost && isPlaying && (
          <div className="mt-6 space-y-4">
            {/* Auto-call controls with slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-call-toggle">Auto-Call</Label>
                  <p className="text-sm text-muted-foreground">
                    {isAutoCallingActive ? `Every ${formattedInterval}` : 'Disabled'}
                  </p>
                </div>
                <Switch 
                  id="auto-call-toggle"
                  checked={isAutoCallingActive} 
                  onCheckedChange={handleToggleAutoCall}
                  disabled={isLoading}
                />
              </div>
              
              {/* Interval Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="interval-slider" className="text-sm">Interval</Label>
                  <span className="text-sm font-medium">{formattedInterval}</span>
                </div>
                <Slider
                  id="interval-slider"
                  min={3}
                  max={15}
                  step={0.5}
                  value={[autoCallInterval]}
                  onValueChange={(values) => setAutoCallInterval(values[0])}
                  disabled={!isHost || isLoading}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3s</span>
                  <span>15s</span>
                </div>
              </div>
            </div>

            {/* Manual Call Button */}
            <Button 
              onClick={handleCallNext} 
              disabled={isLoading || isAutoCallingActive}
              className="w-full"
            >
              Call Next Number
            </Button>
          </div>
        )}
        
        {/* Game End Controls */}
        {isHost && isEnded && (
          <div className="mt-6">
            <Button 
              onClick={handleStartOver} 
              disabled={isLoading}
              className="w-full"
            >
              Start New Game
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
