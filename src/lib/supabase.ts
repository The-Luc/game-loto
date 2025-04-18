import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { RealtimeEventEnum } from './enums';
import { BroadcastPayloadMap, FullBroadcastPayload } from '@/types/broadcast';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create the base Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Store active channels to avoid creating duplicates
const channels = new Map<string, RealtimeChannel>();

/**
 * Get or create a channel for a specific room
 * @param roomId The room ID to get/create a channel for
 * @param presenceKey Optional presence key for user tracking
 * @returns The channel for the room
 */
function getOrCreateChannel(roomId: string, presenceKey = '', client: SupabaseClient = supabase): RealtimeChannel {
  const channelId = `room:${roomId}`;
  let channel = channels.get(channelId);

  if (!channel) {
    channel = client.channel(channelId, {
      config: {
        broadcast: { self: false },
        presence: { key: presenceKey },
      },
    });
    channels.set(channelId, channel);
    channel.subscribe();
  }

  return channel;
}

/**
 * Subscribe to a specific room's channel
 * @param roomId The room ID to subscribe to
 * @param event The event to listen for
 * @param callback Function to call when event is received
 * @returns A function to unsubscribe
 */
export function subscribe<E extends RealtimeEventEnum>(
  roomId: string,
  event: E,
  callback: (payload: BroadcastPayloadMap[E]) => void,
  client: SupabaseClient = supabase
) {
  const channel = getOrCreateChannel(roomId, '', client);

  const subscription = channel.on('broadcast', { event }, (message) => {
    const fullPayload = message.payload as FullBroadcastPayload<E>;
    const { roomId: _, ...eventPayload } = fullPayload;

    callback(eventPayload as BroadcastPayloadMap[E]);
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Broadcast an event to all clients subscribed to a room
 * @param roomId The room ID to broadcast to
 * @param event The event type to broadcast
 * @param payload The data to send
 * @returns Promise that resolves when broadcast is complete
 */
export async function broadcast<E extends RealtimeEventEnum>(
  roomId: string,
  event: E,
  payload: BroadcastPayloadMap[E],
  client: SupabaseClient = supabase
) {
  const channel = getOrCreateChannel(roomId, '', client);

  const fullPayload: FullBroadcastPayload<E> = {
    roomId,
    ...payload,
  };

  try {
    const result = await channel.send({
      type: 'broadcast',
      event,
      payload: fullPayload,
    });
    if (result !== 'ok') {
      console.warn(`Supabase broadcast for event '${event}' to room '${roomId}' failed with status: ${result}`);
    }
    return result;
  } catch (error) {
    console.error(`Supabase broadcast error for event '${event}' to room '${roomId}':`, error);
    throw error;
  }
}

/**
 * Track user presence in a room
 * @param roomId The room ID to track presence in
 * @param userId The user ID to track
 * @param userInfo Additional user information
 * @returns A function to call when leaving the room
 */
export function trackPresence(
  roomId: string,
  userId: string,
  userInfo: Record<string, string | number | boolean | null> = {},
  client: SupabaseClient = supabase
) {
  const channel = getOrCreateChannel(roomId, userId, client);

  channel.track({
    user_id: userId,
    ...userInfo,
  });

  return () => {
    channel.untrack();
  };
}

/**
 * Get all users present in a room
 * @param roomId The room ID to get users for
 * @returns Promise that resolves with the list of users
 */
export async function getPresence(roomId: string, client: SupabaseClient = supabase) {
  const channel = getOrCreateChannel(roomId, '', client);
  return channel.presenceState();
}

/**
 * Clean up all subscriptions for a room
 * @param roomId The room ID to clean up subscriptions for
 */
export function cleanupRoom(roomId: string) {
  const channelId = `room:${roomId}`;
  const channel = channels.get(channelId);

  if (channel) {
    channel.unsubscribe();
    channels.delete(channelId);
  }
}

/**
 * Clean up all subscriptions
 */
export function cleanupAll() {
  channels.forEach((channel) => {
    channel.unsubscribe();
  });
  channels.clear();
}

// Export a convenience object with all the functions for easier imports
export const supabaseRealtime = {
  subscribe,
  broadcast,
  trackPresence,
  getPresence,
  cleanupRoom,
  cleanupAll,
};
