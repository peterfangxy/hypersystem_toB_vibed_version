
export type EventType = 
  | 'TOURNAMENT_UPDATED' 
  | 'REGISTRATION_UPDATED' 
  | 'TABLE_UPDATED' 
  | 'CLOCK_CONFIG_UPDATED'
  | 'STRUCTURE_UPDATED';

export interface BroadcastMessage {
  type: EventType;
  payload?: any;
  timestamp: number;
}

const CHANNEL_NAME = 'rf_poker_pos_events';
const channel = new BroadcastChannel(CHANNEL_NAME);

export const broadcast = (type: EventType, payload?: any) => {
  channel.postMessage({
    type,
    payload,
    timestamp: Date.now()
  });
};

export const subscribe = (callback: (message: BroadcastMessage) => void) => {
  const handler = (event: MessageEvent) => {
    callback(event.data);
  };
  channel.addEventListener('message', handler);
  return () => channel.removeEventListener('message', handler);
};
