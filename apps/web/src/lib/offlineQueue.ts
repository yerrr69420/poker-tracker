import { createClient } from './supabase';

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

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function readQueue(): QueuedMutation[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedMutation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Add a mutation to the offline queue */
export function enqueue(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  payload: Record<string, unknown>
): void {
  const queue = readQueue();
  queue.push({
    id: uid(),
    table,
    operation,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  writeQueue(queue);
}

/** Get number of pending mutations */
export function getPendingCount(): number {
  return readQueue().length;
}

/** Process a single mutation against Supabase */
async function processMutation(mutation: QueuedMutation): Promise<boolean> {
  const supabase = createClient();
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
 * Returns the number of successfully processed items.
 */
export async function flush(): Promise<number> {
  const queue = readQueue();
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
    }
  }

  writeQueue(remaining);
  return processed;
}

/** Clear the entire queue */
export function clearQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(QUEUE_KEY);
}
