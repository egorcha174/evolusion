// entity-kind.ts
import type { UiEntityKind } from './ui-model';

export function getDomain(entityId: string): string {
  return entityId.split('.')[0] ?? '';
}

export function computeKind(domain: string, attrs: Record<string, any>): UiEntityKind {
  // Бинарные исполнительные устройства
  if (['light', 'switch', 'fan', 'humidifier', 'sirene', 'valve', 'lock'].includes(domain)) {
    return 'binary';
  }

  // Датчики / числа
  if (['sensor', 'binary_sensor', 'number', 'text'].includes(domain)) {
    return 'sensor';
  }

  // Специализированные типы
  if (domain === 'climate') return 'climate';
  if (domain === 'media_player') return 'media';
  if (domain === 'vacuum') return 'vacuum';

  // Скрипты / автоматизации / кнопки
  if (domain === 'script') return 'script';
  if (domain === 'automation') return 'automation';
  if (domain === 'button' || domain === 'input_button') return 'button';

  // Всё остальное как информационное
  return 'info';
}

// Пример хелпера на будущее, если захочешь учитывать device_class
export function isBatteryLike(attrs: Record<string, any>): boolean {
  const dc = attrs.device_class as string | undefined;
  return dc === 'battery' || dc === 'battery_charging';
}
