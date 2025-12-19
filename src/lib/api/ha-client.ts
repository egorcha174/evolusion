import type { HAEntity, HAServerConfig, HAMessage, HAConnectionStatus } from '../types/ha';
import { writable } from 'svelte/store';

function validateServerUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export class HAClient {
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, (response: any) => void>();
  private wsUrl: string;

  public connectionStatus = writable<HAConnectionStatus>({
    connected: false,
    serverId: ''
  });

  public entities = writable<HAEntity[]>([]);

  constructor(private config: HAServerConfig) {
    if (!validateServerUrl(config.url)) {
      throw new Error(`Invalid server URL: ${config.url}`);
    }
    this.wsUrl = config.url.replace(/^http/, 'ws') + '/api/websocket';
    this.connectionStatus.update(s => ({ ...s, serverId: config.id }));
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    return new Promise((resolve, reject) => {
      try {
        console.log(`Connecting to ${this.wsUrl}...`);
        this.ws = new WebSocket(this.wsUrl);
        
        const timeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log(`WebSocket connected to ${this.config.name}`);
        };

        this.ws.onmessage = (event) => {
          const message: HAMessage = JSON.parse(event.data);
          this.handleMessage(message, resolve, reject);
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error('WebSocket error:', error);
          this.connectionStatus.update(s => ({
            ...s,
            connected: false,
            error: 'Connection failed'
          }));
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.connectionStatus.update(s => ({ ...s, connected: false }));
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  private handleMessage(
    message: HAMessage,
    resolve: () => void,
    reject: (error: any) => void
  ) {
    if (message.type === 'auth_required') {
      this.authenticate();
    } else if (message.type === 'auth_ok') {
      this.connectionStatus.update(s => ({ ...s, connected: true }));
      this.subscribeToStates();
      resolve();
    } else if (message.type === 'auth_invalid') {
      reject(new Error('Authentication failed'));
    } else if (message.type === 'result' && message.id) {
      const callback = this.pendingRequests.get(message.id);
      if (callback) {
        callback(message);
        this.pendingRequests.delete(message.id);
      }
    } else if (message.type === 'event') {
      this.handleEvent(message);
    }
  }

  private authenticate() {
    this.send({
      type: 'auth',
      access_token: this.config.token
    });
  }

  private subscribeToStates() {
    this.sendWithResponse({
      type: 'subscribe_events',
      event_type: 'state_changed'
    });

    this.sendWithResponse({
      type: 'get_states'
    }).then((response) => {
      if (response.success && response.result) {
        this.entities.set(response.result);
      }
    });
  }

  private handleEvent(message: HAMessage) {
    if (message.event?.event_type === 'state_changed') {
      const newState = message.event.data.new_state;
      this.entities.update((current) => {
        const index = current.findIndex((e) => e.entity_id === newState.entity_id);
        if (index >= 0) {
          current[index] = newState;
        } else {
          current.push(newState);
        }
        return [...current];
      });
    }
  }

  private send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private sendWithResponse(message: any): Promise<any> {
    return new Promise((resolve) => {
      const id = this.messageId++;
      this.pendingRequests.set(id, resolve);
      this.send({ ...message, id });
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async callService(domain: string, service: string, serviceData: any): Promise<any> {
    return this.sendWithResponse({
      type: 'call_service',
      domain,
      service,
      service_data: serviceData
    });
  }
}
