import { describe, it, expect } from 'vitest';
import {
  getDeviceType,
  getStatusText,
  entityToDevice,
  mapEntitiesToRooms
} from './ha-data-mapper';
import type {
  HassEntity,
  HassArea,
  HassDevice,
  HassEntityRegistryEntry,
  DeviceCustomizations
} from '../types/index';

describe('HA Data Mapper', () => {
  describe('getDeviceType', () => {
    it('should return correct device type for light domain', () => {
      const entity: HassEntity = {
        entity_id: 'light.kitchen',
        state: 'on',
        attributes: {},
        last_changed: '2023-01-01T00:00:00',
        last_updated: '2023-01-01T00:00:00'
      };
      expect(getDeviceType(entity)).toBe(1); // DeviceType.Light
    });

    it('should return DimmableLight for light with brightness', () => {
      const entity: HassEntity = {
        entity_id: 'light.living_room',
        state: 'on',
        attributes: { brightness: 128 },
        last_changed: '2023-01-01T00:00:00',
        last_updated: '2023-01-01T00:00:00'
      };
      expect(getDeviceType(entity)).toBe(101); // DeviceType.DimmableLight
    });

    it('should return correct type for climate domain', () => {
      const entity: HassEntity = {
        entity_id: 'climate.thermostat',
        state: 'heat',
        attributes: {},
        last_changed: '2023-01-01T00:00:00',
        last_updated: '2023-01-01T00:00:00'
      };
      expect(getDeviceType(entity)).toBe(7); // DeviceType.Climate
    });
  });

  describe('getStatusText', () => {
    it('should return correct status for climate entity', () => {
      const entity: HassEntity = {
        entity_id: 'climate.thermostat',
        state: 'heat',
        attributes: {},
        last_changed: '2023-01-01T00:00:00',
        last_updated: '2023-01-01T00:00:00'
      };
      expect(getStatusText(entity)).toBe('Нагрев');
    });

    it('should return correct status for media player', () => {
      const entity: HassEntity = {
        entity_id: 'media_player.tv',
        state: 'playing',
        attributes: { media_title: 'Movie' },
        last_changed: '2023-01-01T00:00:00',
        last_updated: '2023-01-01T00:00:00'
      };
      expect(getStatusText(entity)).toBe('Воспроизведение');
    });

    it('should return correct status for light', () => {
      const entity: HassEntity = {
        entity_id: 'light.kitchen',
        state: 'on',
        attributes: {},
        last_changed: '2023-01-01T00:00:00',
        last_updated: '2023-01-01T00:00:00'
      };
      expect(getStatusText(entity)).toBe('Включено');
    });
  });

  describe('entityToDevice', () => {
    it('should convert light entity to device', () => {
      const entity: HassEntity = {
        entity_id: 'light.kitchen',
        state: 'on',
        attributes: { friendly_name: 'Kitchen Light', brightness: 128 },
        last_changed: '2023-01-01T00:00:00',
        last_updated: '2023-01-01T00:00:00'
      };

      const device = entityToDevice(entity);
      expect(device).not.toBeNull();
      expect(device?.id).toBe('light.kitchen');
      expect(device?.name).toBe('Kitchen Light');
      expect(device?.type).toBe(101); // DimmableLight
      expect(device?.brightness).toBe(50); // 128/2.55 ≈ 50
    });

    it('should apply customization', () => {
      const entity: HassEntity = {
        entity_id: 'light.kitchen',
        state: 'on',
        attributes: { friendly_name: 'Kitchen Light' },
        last_changed: '2023-01-01T00:00:00',
        last_updated: '2023-01-01T00:00:00'
      };

      const customization = {
        name: 'Custom Name',
        icon: 'mdi:lightbulb',
        iconAnimation: 'pulse' as const
      };

      const device = entityToDevice(entity, customization);
      expect(device).not.toBeNull();
      expect(device?.name).toBe('Custom Name');
      expect(device?.icon).toBe('mdi:lightbulb');
      expect(device?.iconAnimation).toBe('pulse');
    });
  });

  describe('mapEntitiesToRooms', () => {
    it('should map entities to rooms correctly', () => {
      const entities: HassEntity[] = [
        {
          entity_id: 'light.kitchen',
          state: 'on',
          attributes: { friendly_name: 'Kitchen Light' },
          last_changed: '2023-01-01T00:00:00',
          last_updated: '2023-01-01T00:00:00'
        },
        {
          entity_id: 'light.living_room',
          state: 'off',
          attributes: { friendly_name: 'Living Room Light' },
          last_changed: '2023-01-01T00:00:00',
          last_updated: '2023-01-01T00:00:00'
        }
      ];

      const areas: HassArea[] = [
        { area_id: 'kitchen', name: 'Kitchen' },
        { area_id: 'living_room', name: 'Living Room' }
      ];

      const haDevices: HassDevice[] = [
        { id: 'device1', name: 'Device 1', area_id: 'kitchen' },
        { id: 'device2', name: 'Device 2', area_id: 'living_room' }
      ];

      const entityRegistry: HassEntityRegistryEntry[] = [
        {
          entity_id: 'light.kitchen',
          device_id: 'device1',
          area_id: 'kitchen',
          name: 'Kitchen Light',
          platform: 'light'
        },
        {
          entity_id: 'light.living_room',
          device_id: 'device2',
          area_id: 'living_room',
          name: 'Living Room Light',
          platform: 'light'
        }
      ];

      const customizations: DeviceCustomizations = {};

      const rooms = mapEntitiesToRooms(
        entities,
        areas,
        haDevices,
        entityRegistry,
        customizations
      );

      expect(rooms.length).toBe(2);
      expect(rooms[0].name).toBe('Kitchen');
      expect(rooms[0].devices.length).toBe(1);
      expect(rooms[1].name).toBe('Living Room');
      expect(rooms[1].devices.length).toBe(1);
    });

    it('should handle entities without area', () => {
      const entities: HassEntity[] = [
        {
          entity_id: 'light.no_area',
          state: 'on',
          attributes: { friendly_name: 'No Area Light' },
          last_changed: '2023-01-01T00:00:00',
          last_updated: '2023-01-01T00:00:00'
        }
      ];

      const areas: HassArea[] = [];
      const haDevices: HassDevice[] = [];
      const entityRegistry: HassEntityRegistryEntry[] = [
        {
          entity_id: 'light.no_area',
          device_id: null,
          area_id: null,
          name: 'No Area Light',
          platform: 'light'
        }
      ];

      const customizations: DeviceCustomizations = {};

      const rooms = mapEntitiesToRooms(
        entities,
        areas,
        haDevices,
        entityRegistry,
        customizations
      );

      expect(rooms.length).toBe(1);
      expect(rooms[0].name).toBe('No Area');
      expect(rooms[0].devices.length).toBe(1);
    });
  });
});
