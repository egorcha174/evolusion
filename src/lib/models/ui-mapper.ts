// ui-mapper.ts
// Маппирование Home Assistant сущностей на UI модель

import type { HaState } from '../types/ha-types';
import type { UiEntity } from './ui-model';
import { getDomain, computeKind } from './entity-kind';
import { computeActions } from './entity-actions';

export function mapHaStateToUiEntity(state: HaState): UiEntity {
  const domain = getDomain(state.entity_id);
  const kind = computeKind(domain, state.attributes);
  const actions = computeActions(state);

  const baseEntity: UiEntity = {
    id: state.entity_id,
    domain,
    kind,
    name: state.attributes.friendly_name || state.entity_id,
    state: state.state,
    value: extractValue(state),
    actions,
    supportsToggle: actions.some(a => a.id === 'toggle'),
    supportsDetails: ['climate', 'media', 'vacuum'].includes(domain),
    isUnavailable: state.state === 'unavailable',
    attributes: state.attributes
  };

  // Добавляем light-specific параметры
  if (kind === 'light') {
    baseEntity.brightness = state.attributes.brightness ? Math.round((state.attributes.brightness / 255) * 100) : undefined;
    baseEntity.colorMode = state.attributes.color_mode;
    baseEntity.colorTemp = state.attributes.color_temp;
    if (state.attributes.rgb_color) {
      baseEntity.color = {
        r: state.attributes.rgb_color[0],
        g: state.attributes.rgb_color[1],
        b: state.attributes.rgb_color[2]
      };
    }
  }

  return baseEntity;
}

function extractValue(state: HaState): string | number | undefined {
  const attrs = state.attributes;
  
  // Датчики / информация
  if (attrs.unit_of_measurement) {
    return state.state;
  }
  
  // Температура (климат)
  if (attrs.current_temperature !== undefined) {
    return attrs.current_temperature;
  }
  
  // Стандартное значение
  return state.state;
}

export function computeSeverity(
  state: HaState
): 'normal' | 'warning' | 'error' | undefined {
  const s = state.state;
  
  if (s === 'unavailable' || s === 'unknown') return 'error';
  if (
    typeof state.attributes.battery === 'number' &&
    state.attributes.battery < 20
  )
    return 'warning';
  
  return undefined;
}
