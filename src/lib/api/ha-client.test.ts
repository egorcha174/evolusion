import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HAClient } from './ha-client';
import type { HAServerConfig } from '../types/ha';

const validConfig: HAServerConfig = {
  id: 'test-server',
  name: 'Test Server',
  url: 'http://localhost:8123',
  token: 'test-token',
  enabled: true
};

describe('HAClient', () => {
  beforeEach(() => {
    vi.stubGlobal('WebSocket', vi.fn() as any);
  });

  it('throws on invalid server URL', () => {
    const badConfig: HAServerConfig = {
      ...validConfig,
      url: 'not-a-url'
    };

    expect(() => new HAClient(badConfig)).toThrowError();
  });

  it('sets connectionStatus serverId in constructor', () => {
    const client = new HAClient(validConfig);
    let value: any;

    const unsubscribe = client.connectionStatus.subscribe((v) => {
      value = v;
    });

    expect(value.serverId).toBe('test-server');

    unsubscribe();
  });
});
