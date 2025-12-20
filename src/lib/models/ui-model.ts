import type { UiEntityKind } from './entity-kind';

export type UiSeverity = 'normal' | 'warning' | 'error';

export interface UiEntityAction {
  id: string;                 // 'toggle', 'turn_on', 'turn_off', 'set_temperature', ...
  label: string;              // Текст на кнопке
  icon?: string;              // Имя иконки (например, mdi:power)
  service: string;            // 'light.turn_on', 'vacuum.return_to_base', ...
  serviceData?: Record<string, any>; // Базовый payload (кроме entity_id можно тоже положить сюда)
  confirm?: boolean;          // Нужен ли диалог подтверждения
  primary?: boolean;          // Основное действие карточки
}

export interface UiEntity {
  // Идентификация
  id: string;                 // entity_id из HA, например 'light.kitchen_ceiling'
  domain: string;             // 'light', 'switch', 'sensor', ...
  kind: UiEntityKind;         // Поведенческий тип для UI

  // Отображение
  name: string;               // Friendly name
  area?: string;              // Человекочитаемая комната/зона
  icon?: string;              // Иконка, уже подобранная под устройство
  order?: number;             // Доп. сортировка внутри группы

  // Состояние
  state: string;              // Сырой state: 'on', 'off', 'heat', 'cool', 'playing', ...
  value?: number | string;    // Главная величина (температура, мощность, %, уровень сигнала и т.п.)
    brightness?: number;       // 0-255 for lights
  colorMode?: string;          // 'rgb', 'xy', 'hs', etc.
  color?: { r: number; g: number; b: number }; // RGB color
  colorTemp?: number;          // Color temperature in mireds
  unit?: string;              // Единица измерения (°, %, W, кВт·ч, дБм, ...)
  severity?: UiSeverity;      // Для цвета/акцента (например, низкий заряд, ошибка и т.п.)
  isUnavailable?: boolean;    // Удобный флаг на основе state / attributes
  lastChanged?: string;       // ISO-строка из HA state.last_changed, если нужно

  // Возможности
  supportsToggle: boolean;
  supportsDetails: boolean;   // Есть ли расширенная панель (climate/media/vacuum и т.п.)

  actions: UiEntityAction[];  // Нормализованный список доступных действий

  // Сырые данные на всякий случай
  attributes: Record<string, any>;
}

export type CardType =
  | 'binary'
  | 'sensor'
  | 'climate'
  | 'media'
  | 'vacuum'
  | 'info'
  | 'custom';

export interface CardLayout {
  x: number;  // колонка в гриде
  y: number;  // строка
  w: number;  // ширина в колонках
  h: number;  // высота в рядах
}

export interface CardOverrides {
  title?: string;             // Переопределить заголовок
  icon?: string;              // Переопределить иконку
  showName?: boolean;
  showIcon?: boolean;
  showUnit?: boolean;
  compact?: boolean;          // Компактный режим
  colorScheme?: string;       // Имя цветовой схемы/темы для карточки
}

export interface CardConfig {
  id: string;                 // Внутренний ID карточки
  type: CardType;             // Тип UI-карточки (а не домен HA)
  entities: string[];         // Список entity_id, с которыми она работает

  layout: CardLayout;         // Позиция/размер в гриде
  group?: string;             // Логическая группа/секция (например, 'Гостиная', 'Серверная')

  overrides?: CardOverrides;  // Локальные настройки отображения

  // Возможное расширение под особые карты:
  options?: Record<string, any>; // Специфичные настройки (например, какие атрибуты выводить)
}
