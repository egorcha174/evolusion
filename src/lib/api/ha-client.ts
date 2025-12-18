  import type { HAEntity, HAServerConfig, HAMessage, HAConnectionStatus } from '../types/ha';
import { writable } from 'svelte/store';

export class HAClient {
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, (response: any) => void>();
  
  public connectionStatus = writable<HAConnectionStatus>({
    connected: false,
    serverId: ''
  });
  
  public entities = writable<HAEntity[]>([]);

  constructor(private config: HAServerConfig) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.url.replace('http', 'ws') + '/api/websocket';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        const message: HAMessage = JSON.parse(event.data);
        this.handleMessage(message, resolve, reject);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus.set({
          connected: false,
          serverId: this.config.id,
          error: 'Connection failed'
        });
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.connectionStatus.set({
          connected: false,
          serverId: this.config.id
        });
      };
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
      this.connectionStatus.set({
        connected: true,
        serverId: this.config.id
      });
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
        return current;
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
}
