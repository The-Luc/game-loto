import {
  createClient,
  SupabaseClient,
  RealtimeChannel,
} from '@supabase/supabase-js';
import { BroadcastPayloadMap } from '@/types/broadcast';

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
function getOrCreateChannel(
  roomId: string,
  presenceKey = '',
  client: SupabaseClient = supabase
): RealtimeChannel {
  const channelId = `room:${roomId}`;
  let channel = channels.get(channelId);

  if (channel) {
    console.log(`[SupabaseRealtime] Reusing existing channel: ${channelId}`);
    return channel;
  }

  console.log(`[SupabaseRealtime] Creating new channel: ${channelId}`);
  channel = client.channel(channelId, {
    config: {
      broadcast: { self: false },
      presence: { key: presenceKey },
    },
  });
  channels.set(channelId, channel);
  console.log(`[SupabaseRealtime] Subscribing to channel: ${channelId}`);
  channel.subscribe((status, err) => {
    if (err) {
      console.error(
        `[SupabaseRealtime] Channel ${channelId} subscription error:`,
        err
      );
    } else {
      console.log(
        `[SupabaseRealtime] Channel ${channelId} subscription status: ${status}`
      );
    }
  });

  return channel;
}

/**
 * Subscribe to a specific room's channel
 * @param roomId The room ID to subscribe to
 * @param event The event to listen for
 * @param callback Function to call when event is received
 * @returns A function to unsubscribe
 */
export function subscribe<E extends keyof BroadcastPayloadMap>(
  roomId: string,
  event: E,
  callback: (payload: BroadcastPayloadMap[E]) => void,
  client: SupabaseClient = supabase
) {
  const channel = getOrCreateChannel(roomId, '', client);
  console.log(
    `[SupabaseRealtime] Setting up listener for event '${event}' on channel ${channel.topic}`
  );

  const subscription = channel.on('broadcast', { event }, (message) => {
    console.log(
      `[SupabaseRealtime] Raw message received for event '${event}' on ${channel.topic}:`,
      message
    );
    // Assert the expected structure based on our broadcast logic
    const fullPayload = message.payload as {
      roomId: string;
    } & BroadcastPayloadMap[E];

    // Extract the event-specific payload (excluding roomId) for the callback
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roomId: _, ...eventPayload } = fullPayload;

    console.log(
      `[SupabaseRealtime] Calling component callback for event '${event}' with payload:`,
      eventPayload
    );
    // Call the user's callback with the correctly typed event-specific payload
    callback(eventPayload as unknown as BroadcastPayloadMap[E]);
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
export async function broadcast<E extends keyof BroadcastPayloadMap>(
  roomId: string,
  event: E,
  payload: BroadcastPayloadMap[E],
  client: SupabaseClient = supabase
) {
  const channel = getOrCreateChannel(roomId, '', client);

  // Construct the full payload including the roomId
  const fullPayload = {
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
      console.warn(
        `Supabase broadcast for event '${event}' to room '${roomId}' failed with status: ${result}`
      );
    }
    return result;
  } catch (error) {
    console.error(
      `Supabase broadcast error for event '${event}' to room '${roomId}':`,
      error
    );
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
export async function getPresence(
  roomId: string,
  client: SupabaseClient = supabase
) {
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
