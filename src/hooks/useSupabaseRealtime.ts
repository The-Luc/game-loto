import { useEffect, useCallback, useRef } from 'react';
import { supabaseRealtime, GamePayload } from '@/lib/supabase';
import { RealtimeEventEnum } from '../enum';

type UnsubscribeFn = () => void;

/**
 * Hook for using Supabase real-time functionality in components
 * @param roomId The room ID to subscribe to
 * @returns An object with methods for interacting with real-time features
 */
export function useSupabaseRealtime(roomId: string) {
  // Keep track of all active subscriptions so we can clean them up
  const subscriptions = useRef<UnsubscribeFn[]>([]);

  // Clean up subscriptions when component unmounts or roomId changes
  useEffect(() => {
    return () => {
      // Clean up all subscriptions when component unmounts or roomId changes
      subscriptions.current.forEach(unsubscribe => unsubscribe());
      subscriptions.current = [];
    };
  }, [roomId]);

  /**
   * Subscribe to a specific event in the room
   * @param event The event to listen for
   * @param callback Function to call when event is received
   */
  const subscribe = useCallback(
    (event: RealtimeEventEnum, callback: (payload: GamePayload) => void) => {
      if (!roomId) return;

      const unsubscribe = supabaseRealtime.subscribe(roomId, event, callback);
      subscriptions.current.push(unsubscribe);

      return unsubscribe;
    },
    [roomId]
  );

  /**
   * Broadcast an event to all clients in the room
   * @param event The event type to broadcast
   * @param payload The data to send
   */
  const broadcast = useCallback(
    async (event: RealtimeEventEnum, payload: Omit<GamePayload, 'roomId'>) => {
      if (!roomId) return;
      return supabaseRealtime.broadcast(roomId, event, payload);
    },
    [roomId]
  );

  /**
   * Track the current user's presence in the room
   * @param userId The current user's ID
   * @param userInfo Additional information about the user
   */
  const trackPresence = useCallback(
    (userId: string, userInfo: Record<string, string | number | boolean | null> = {}) => {
      if (!roomId || !userId) return;

      const untrack = supabaseRealtime.trackPresence(roomId, userId, userInfo);
      subscriptions.current.push(untrack);

      return untrack;
    },
    [roomId]
  );

  /**
   * Get all users present in the room
   * @returns Promise that resolves with the list of users
   */
  const getPresence = useCallback(async () => {
    if (!roomId) return {};
    return supabaseRealtime.getPresence(roomId);
  }, [roomId]);

  return {
    subscribe,
    broadcast,
    trackPresence,
    getPresence,
  };
}
