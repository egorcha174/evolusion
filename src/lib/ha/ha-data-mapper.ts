import {
  DeviceType,
  type HassEntity,
  type Device,
  type Room,
  type HassArea,
  type HassDevice,
  type HassEntityRegistryEntry,
  type DeviceCustomization,
  type DeviceCustomizations,
  type WeatherForecast
} from '../types/index';

/**
 * Extracts domain from entity_id (e.g., 'light.kitchen' -> 'light')
 */
function getDomainFromEntityId(entityId: string): string {
  return entityId.split('.')[0];
}

/**
 * Determines device type based on entity domain and attributes
 */
export function getDeviceType(entity: HassEntity): DeviceType {
  const domain = getDomainFromEntityId(entity.entity_id);
  const attributes = entity.attributes || {};

  // Priority 1: Domain + attributes mapping (highest priority)
  if (domain === 'light' && attributes.brightness !== undefined) {
    return DeviceType.DimmableLight;
  }

  // Priority 2: Domain-based mapping
  switch (domain) {
    case 'light': return DeviceType.Light;
    case 'switch': return DeviceType.Switch;
    case 'sensor': return DeviceType.Sensor;
    case 'binary_sensor': return DeviceType.BinarySensor;
    case 'media_player': return DeviceType.MediaPlayer;
    case 'climate': return DeviceType.Climate;
    case 'vacuum': return DeviceType.Vacuum;
    case 'lock': return DeviceType.Lock;
    case 'cover': return DeviceType.Cover;
    case 'fan': return DeviceType.Fan;
    case 'input_boolean': return DeviceType.InputBoolean;
    case 'input_number': return DeviceType.InputNumber;
    case 'input_text': return DeviceType.InputText;
    case 'input_select': return DeviceType.InputSelect;
    case 'timer': return DeviceType.Timer;
    case 'scene': return DeviceType.Scene;
    case 'script': return DeviceType.Script;
    case 'automation': return DeviceType.Automation;
    case 'update': return DeviceType.Update;
    case 'person': return DeviceType.Person;
    case 'weather': return DeviceType.Weather;
    case 'siren': return DeviceType.Siren;
  }

  // Priority 3: Keyword-based mapping
  const friendlyName = (attributes.friendly_name || '').toLowerCase();
  if (friendlyName.includes('lamp')) return DeviceType.Lamp;
  if (friendlyName.includes('spotlight')) return DeviceType.Spotlight;
  if (friendlyName.includes('balcony') && friendlyName.includes('light')) return DeviceType.BalconyLight;
  if (friendlyName.includes('tv')) return DeviceType.TV;
  if (friendlyName.includes('speaker')) return DeviceType.Speaker;
  if (friendlyName.includes('playstation')) return DeviceType.Playstation;
  if (friendlyName.includes('computer')) return DeviceType.Computer;
  if (friendlyName.includes('monitor')) return DeviceType.Monitor;
  if (friendlyName.includes('door') && friendlyName.includes('sensor')) return DeviceType.DoorSensor;
  if (friendlyName.includes('outlet')) return DeviceType.Outlet;
  if (friendlyName.includes('humidifier')) return DeviceType.Humidifier;

  return DeviceType.Unknown;
}

/**
 * Gets status text for entity based on domain and state
 */
export function getStatusText(entity: HassEntity): string {
  const domain = getDomainFromEntityId(entity.entity_id);
  const state = entity.state;
  const attributes = entity.attributes || {};

  switch (domain) {
    case 'climate':
      if (state === 'heat') return 'Нагрев';
      if (state === 'cool') return 'Охлаждение';
      if (state === 'auto') return 'Авто';
      if (state === 'off') return 'Выключено';
      return state;

    case 'media_player':
      if (state === 'playing') return 'Воспроизведение';
      if (state === 'paused') return 'Пауза';
      if (state === 'idle') return 'Простой';
      if (state === 'off') return 'Выключено';
      return attributes.media_title || state;

    case 'weather':
      return attributes.condition || state;

    case 'cover':
      if (state === 'open') return 'Открыто';
      if (state === 'closed') return 'Закрыто';
      if (state === 'opening') return 'Открывается';
      if (state === 'closing') return 'Закрывается';
      return state;

    case 'lock':
      if (state === 'locked') return 'Заблокировано';
      if (state === 'unlocked') return 'Разблокировано';
      return state;

    case 'person':
      if (state === 'home') return 'Дома';
      if (state === 'not_home') return 'Не дома';
      return state;

    case 'vacuum':
      if (state === 'cleaning') return 'Уборка';
      if (state === 'returning') return 'Возвращение';
      if (state === 'docked') return 'На базе';
      if (state === 'idle') return 'Простой';
      return state;

    case 'update':
      if (state === 'on') return 'Доступно обновление';
      if (state === 'off') return 'Актуально';
      return state;

    case 'timer':
      if (state === 'active') return 'Активно';
      if (state === 'idle') return 'Неактивно';
      return state;

    case 'automation':
    case 'script':
    case 'scene':
      if (state === 'on') return 'Включено';
      if (state === 'off') return 'Выключено';
      return state;

    case 'binary_sensor':
      if (state === 'on') return 'Обнаружено';
      if (state === 'off') return 'Не обнаружено';
      return state;

    case 'sensor':
      return `${state} ${attributes.unit_of_measurement || ''}`.trim();

    case 'input_number':
      return `Значение: ${state}`;

    default:
      // General on/off handling
      if (state === 'on') return 'Включено';
      if (state === 'off') return 'Выключено';
      return state;
  }
}

/**
 * Converts HA entity to internal Device representation
 */
export function entityToDevice(
  entity: HassEntity,
  customization?: DeviceCustomization,
  sideLoadedForecast?: WeatherForecast[]
): Device | null {
  const domain = getDomainFromEntityId(entity.entity_id);
  const attributes = entity.attributes || {};
  const deviceType = customization?.type || getDeviceType(entity);

  // Base device properties
  const device: Device = {
    id: entity.entity_id,
    name: customization?.name || attributes.friendly_name || entity.entity_id,
    type: deviceType,
    state: entity.state,
    status: getStatusText(entity),
    haDomain: domain,
    haDeviceClass: attributes.device_class,
    attributes: entity.attributes,
  };

  // Add domain-specific properties
  switch (domain) {
    case 'light':
      if (attributes.brightness !== undefined) {
        device.brightness = Math.round(attributes.brightness / 2.55); // Convert 0-255 to 0-100
      }
      break;

    case 'climate':
      if (attributes.current_temperature !== undefined) {
        device.temperature = attributes.current_temperature;
      }
      if (attributes.temperature !== undefined) {
        device.targetTemperature = attributes.temperature;
      }
      if (attributes.hvac_action) {
        device.hvacAction = attributes.hvac_action;
      }
      if (attributes.hvac_modes) {
        device.hvacModes = attributes.hvac_modes;
      }
      if (attributes.preset_mode) {
        device.presetMode = attributes.preset_mode;
      }
      if (attributes.preset_modes) {
        device.presetModes = attributes.preset_modes;
      }
      if (attributes.current_humidity !== undefined) {
        device.currentHumidity = attributes.current_humidity;
      }
      if (attributes.target_humidity !== undefined) {
        device.targetHumidity = attributes.target_humidity;
      }
      if (attributes.min_temp !== undefined) {
        device.minTemp = attributes.min_temp;
      }
      if (attributes.max_temp !== undefined) {
        device.maxTemp = attributes.max_temp;
      }
      break;

    case 'media_player':
      if (attributes.media_title) {
        device.mediaTitle = attributes.media_title;
      }
      if (attributes.media_artist) {
        device.mediaArtist = attributes.media_artist;
      }
      if (attributes.app_name) {
        device.appName = attributes.app_name;
      }
      if (attributes.entity_picture) {
        device.entityPictureUrl = attributes.entity_picture;
      }
      break;

    case 'weather':
      if (attributes.condition) {
        device.condition = attributes.condition;
      }
      if (sideLoadedForecast) {
        device.forecast = sideLoadedForecast;
      }
      break;

    case 'cover':
      if (attributes.current_position !== undefined) {
        device.currentPosition = attributes.current_position;
      }
      break;

    case 'fan':
      if (attributes.percentage !== undefined) {
        device.fanSpeed = attributes.percentage;
      } else if (attributes.speed !== undefined) {
        device.fanLevel = attributes.speed;
      }
      if (attributes.speed_list) {
        device.fanLevels = attributes.speed_list;
      }
      break;

    case 'sensor':
    case 'binary_sensor':
      if (attributes.battery_level !== undefined) {
        device.batteryLevel = attributes.battery_level;
      }
      break;
  }

  // Apply customization
  if (customization) {
    if (customization.icon) {
      device.icon = customization.icon;
    }
    if (customization.iconAnimation) {
      device.iconAnimation = customization.iconAnimation;
    }
  }

  return device;
}

/**
 * Maps HA entities to rooms
 */
export function mapEntitiesToRooms(
  entities: HassEntity[],
  areas: HassArea[],
  haDevices: HassDevice[],
  entityRegistry: HassEntityRegistryEntry[],
  customizations: DeviceCustomizations,
  showHidden: boolean = false,
  forecasts?: Record<string, WeatherForecast[]>
): Room[] {
  // Create area map for quick lookup
  const areaMap: Record<string, HassArea> = {};
  areas.forEach(area => {
    areaMap[area.area_id] = area;
  });

  // Create device map for quick lookup
  const deviceMap: Record<string, HassDevice> = {};
  haDevices.forEach(device => {
    deviceMap[device.id] = device;
  });

  // Create entity registry map for quick lookup
  const entityRegistryMap: Record<string, HassEntityRegistryEntry> = {};
  entityRegistry.forEach(entry => {
    entityRegistryMap[entry.entity_id] = entry;
  });

  // Group devices by area
  const devicesByArea: Record<string, Device[]> = {};

  for (const entity of entities) {
    // Skip hidden entities if showHidden is false
    const customization = customizations[entity.entity_id];
    if (!showHidden && customization?.isHidden) {
      continue;
    }

    // Get area_id from entity registry
    const registryEntry = entityRegistryMap[entity.entity_id];
    if (!registryEntry) continue;

    let areaId = registryEntry.area_id;

    // If no area_id in registry, try to get it from device
    if (!areaId && registryEntry.device_id) {
      const device = deviceMap[registryEntry.device_id];
      if (device) {
        areaId = device.area_id;
      }
    }

    // Convert entity to device
    const device = entityToDevice(
      entity,
      customization,
      forecasts?.[entity.entity_id]
    );

    if (!device) continue;

    // Group by area
    if (areaId) {
      if (!devicesByArea[areaId]) {
        devicesByArea[areaId] = [];
      }
      devicesByArea[areaId].push(device);
    } else {
      // Devices without area go to "No Area" room
      const noAreaId = 'no-area';
      if (!devicesByArea[noAreaId]) {
        devicesByArea[noAreaId] = [];
      }
      devicesByArea[noAreaId].push(device);
    }
  }

  // Create rooms from areas
  const rooms: Room[] = [];

  // First, add rooms with actual areas
  Object.keys(devicesByArea).forEach(areaId => {
    if (areaId === 'no-area') return;

    const area = areaMap[areaId];
    if (area) {
      rooms.push({
        id: area.area_id,
        name: area.name,
        devices: devicesByArea[areaId]
      });
    }
  });

  // Then add "No Area" room if it has devices
  if (devicesByArea['no-area'] && devicesByArea['no-area'].length > 0) {
    rooms.push({
      id: 'no-area',
      name: 'No Area',
      devices: devicesByArea['no-area']
    });
  }

  return rooms;
}
