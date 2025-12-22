// entity-actions.ts
import type { UiEntityAction } from './ui-model';
import type { HaState } from '../types/ha-types';
import { getDomain } from './entity-kind';

export function computeActions(raw: HaState): UiEntityAction[] {
  const domain = getDomain(raw.entity_id);
  const id = raw.entity_id;

  if (['light', 'switch', 'fan', 'humidifier'].includes(domain)) {
    return [
      {
        id: 'toggle',
        label: 'Переключить',
        icon: 'mdi:power',
        service: `${domain}.toggle`,
        serviceData: { entity_id: id },
        primary: true
      }
    ];
  }

  if (domain === 'climate') {
    return [
      {
        id: 'set_temperature',
        label: 'Температура',
        icon: 'mdi:thermostat',
        service: 'climate.set_temperature',
        serviceData: { entity_id: id }
      }
    ];
  }

  if (domain === 'media_player') {
    return [
      {
        id: 'play_pause',
        label: 'Play/Pause',
        icon: 'mdi:play-pause',
        service: 'media_player.media_play_pause',
        serviceData: { entity_id: id },
        primary: true
      }
    ];
  }

  if (domain === 'vacuum') {
    return [
      {
        id: 'start',
        label: 'Старт',
        icon: 'mdi:play',
        service: 'vacuum.start',
        serviceData: { entity_id: id },
        primary: true
      },
      {
        id: 'return_to_base',
        label: 'На базу',
        icon: 'mdi:home-export-outline',
        service: 'vacuum.return_to_base',
        serviceData: { entity_id: id }
      }
    ];
  }

  if (domain === 'script') {
    return [
      {
        id: 'run',
        label: 'Запустить',
        icon: 'mdi:play',
        service: 'script.turn_on',
        serviceData: { entity_id: id },
        primary: true
      }
    ];
  }

  if (domain === 'automation') {
    return [
      {
        id: 'trigger',
      label: 'Запустить',        icon: 'mdi:play-pause',
        service: 'automation.trigger',
        serviceData: { entity_id: id },
        primary: true
      }
    ];
  }

  if (domain === 'button' || domain === 'input_button') {
    return [
      {
        id: 'press',
        label: 'Нажать',
        icon: 'mdi:gesture-tap-button',
        service: 'button.press',
        serviceData: { entity_id: id },
        primary: true
      }
    ];
  }

  // По умолчанию — без действий
  return [];
}
