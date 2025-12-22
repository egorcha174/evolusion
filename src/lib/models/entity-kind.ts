// entity-kind.ts
// Определение типов сущностей и их характеристик


export type UiEntityKind = 'sensor' | 'switch' | 'light' | 'button' | 'climate' | 'media' | 'vacuum';

export function getDomain(entityId: string): string {
  if (!entityId || typeof entityId !== 'string') {
    return '';
  }
  return entityId.split('.')[0] ?? '';
}

export function computeKind(domain: string, attrs: Record<string, any>): UiEntityKind {
  // Выключатели / переключатели
  if (['light', 'switch', 'fan', 'humidifier', 'siren', 'valve', 'lock'].includes(domain)) {
    return 'switch';
  }

  // Огни с расширенными возможностями
  if (domain === 'light') {
    if (attrs?.brightness !== undefined || attrs?.color_mode !== undefined) {
      return 'light';
    }
    return 'switch';
  }

  // Датчики / информация
  if (['sensor', 'binary_sensor', 'number', 'text'].includes(domain)) {
    return 'sensor';
  }

  // Специализированные типы
  if (domain === 'climate') return 'climate';
  if (domain === 'media_player') return 'media';
  if (domain === 'vacuum') return 'vacuum';

  // Скрипты / автоматизации / кнопки
  if (domain === 'script') return 'button';
  if (domain === 'automation') return 'button';
  if (domain === 'button' || domain === 'input_button') return 'button';

  // Всё остальное как информационное
  return 'sensor';
}
