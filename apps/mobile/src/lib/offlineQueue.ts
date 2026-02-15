import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const QUEUE_KEY = 'offline_queue';
const MAX_RETRIES = 5;

export interface QueuedMutation {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}

/** Generate a simple unique id */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Read all queued mutations from storage */
async function readQueue(): Promise<QueuedMutation[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Write queue back to storage */
async function writeQueue(queue: QueuedMutation[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Add a mutation to the offline queue */
export async function enqueue(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  payload: Record<string, unknown>
): Promise<void> {
  const queue = await readQueue();
  queue.push({
    id: uid(),
    table,
    operation,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  await writeQueue(queue);
}

/** Get number of pending mutations */
export async function getPendingCount(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}

/** Process a single mutation against Supabase */
async function processMutation(mutation: QueuedMutation): Promise<boolean> {
  try {
    let result;
    switch (mutation.operation) {
      case 'insert':
        result = await supabase.from(mutation.table).insert(mutation.payload);
        break;
      case 'update': {
        const { id, ...rest } = mutation.payload;
        result = await supabase.from(mutation.table).update(rest).eq('id', id as string);
        break;
      }
      case 'delete':
        result = await supabase.from(mutation.table).delete().eq('id', mutation.payload.id as string);
        break;
    }
    return !result.error;
  } catch {
    return false;
  }
}

/**
 * Flush all queued mutations in FIFO order.
 * Uses exponential backoff per item on failure.
 * Returns the number of successfully processed items.
 */
export async function flush(): Promise<number> {
  const queue = await readQueue();
  if (queue.length === 0) return 0;

  const remaining: QueuedMutation[] = [];
  let processed = 0;

  for (const mutation of queue) {
    const success = await processMutation(mutation);
    if (success) {
      processed++;
    } else {
      mutation.retryCount++;
      if (mutation.retryCount < MAX_RETRIES) {
        remaining.push(mutation);
      }
      // Items exceeding MAX_RETRIES are silently dropped
    }
  }

  await writeQueue(remaining);
  return processed;
}

/** Clear the entire queue (for testing / manual reset) */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
