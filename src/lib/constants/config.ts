// Константы конфигурации приложения
export const CONFIG = {
  RECONNECT_INTERVAL_MS: 5000, // 5 секунд
  MAX_RETRIES: 3,
  STORAGE_KEY: 'ha_servers_v2',
  REQUEST_TIMEOUT_MS: 30000, // 30 секунд
  SESSION_DURATION_MS: 24 * 60 * 60 * 1000 // 24 часа
} as const;

export const MESSAGES = {
  CONNECTION_SUCCESS: 'Успешно подключено',
  CONNECTION_ERROR: 'Ошибка подключения',
  VALIDATION_ERROR: 'Ошибка валидации данных',
  STORAGE_ERROR: 'Ошибка при работе с хранилищем'
} as const;
