// Home Assistant TypeScript Types

export interface HAEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export interface HAServerConfig {
  id: string;
  name: string;
  url: string;
  token: string;
  enabled: boolean;
}

export interface HAConnectionStatus {
  connected: boolean;
  serverId: string;
  error?: string;
}

export type HAMessageType =
  | 'auth_required'
  | 'auth_ok'
  | 'auth_invalid'
  | 'result'
  | 'event';

export interface HAMessage {
  type: HAMessageType;
  id?: number;
  [key: string]: any;
}
