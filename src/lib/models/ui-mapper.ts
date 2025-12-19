// ui-mapper.ts
import type { HaState } from '../types/ha-types';
import type { UiEntity, CardConfig } from './ui-model';
import { getDomain, computeKind } from './entity-kind';
import { computeActions } from './entity-actions';

function computePrimaryValue(
  domain: string,
  state: HaState
): { value?: number | string; unit?: string } {
  const attrs = state.attributes;
  const unit = attrs.unit_of_measurement as string | undefined;

  if (['sensor', 'number', 'binary_sensor'].includes(domain)) {
    return { value: state.state, unit };
  }

  if (domain === 'climate') {
    const current = attrs.current_temperature ?? state.state;
    return { value: current, unit: attrs.temperature_unit ?? unit };
  }

  return { value: state.state, unit: undefined };
}

function computeSeverity(
  state: HaState
): 'normal' | 'warning' | 'error' | undefined {
  const s = state.state;
  if (s === 'unavailable' || s === 'unknown') return 'error';
  if (
    typeof state.attributes.battery === 'number' &&
    state.attributes.battery < 20
  ) {
    return 'warning';
  }
  return undefined;
}

export function mapHaStateToUiEntity(raw: HaState): UiEntity {
  const domain = getDomain(raw.entity_id);
  const attrs = raw.attributes ?? {};
  const kind = computeKind(domain, attrs);
  const { value, unit } = computePrimaryValue(domain, raw);
  const severity = computeSeverity(raw);

  const name =
    (attrs.friendly_name as string | undefined) ??
    raw.entity_id
      .split('.')[1]
      ?.replace(/_/g, ' ') ??
    raw.entity_id;

  const isUnavailable =
    raw.state === 'unavailable' || raw.state === 'unknown';
  const actions = computeActions(raw);

  return {
    id: raw.entity_id,
    domain,
    kind,
    name,
    area: (attrs.area_name as string | undefined) ?? undefined,
    icon: (attrs.icon as string | undefined) ?? undefined,
    order: undefined,

    state: raw.state,
    value,
    unit,
    severity,
    isUnavailable,
    lastChanged: raw.last_changed,

    supportsToggle: actions.some((a) => a.id === 'toggle'),
    supportsDetails:
      kind === 'climate' || kind === 'media' || kind === 'vacuum',

    actions,
    attributes: attrs
  };
}

export function resolveCardEntities(
  card: CardConfig,
  uiEntities: UiEntity[]
): UiEntity[] {
  const byId = new Map<string, UiEntity>();
  for (const e of uiEntities) {
    byId.set(e.id, e);
  }

  const resolved: UiEntity[] = [];

  for (const entityId of card.entities) {
    const ent = byId.get(entityId);
    if (ent) {
      resolved.push(ent);
    }
  }

  // На будущее: тут можно фильтровать/сортировать по kind/severity/area и т.п.
  return resolved;
}
