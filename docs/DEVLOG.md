# DEVLOG - Evolusion Dashboard Development Log

Этот файл документирует реальное содержание "пустых" коммитов в истории проекта, чтобы сделать их понятными для людей и ИИ.

## 2025-12-22 — Быстрые прототипные коммиты

### Серия коммитов по улучшению ServerList и серверного хранилища

- `123456` (cb24eae), `12345` (e43fecd), `1234` (010d638)
  Серия быстрых изменений для улучшения работы с серверами и их отображения:
  - Улучшена логика работы с persisted-store в `servers.ts` (удалены зависимости от Svelte 5 runes)
  - Добавлена поддержка шифрования/дешифрования токенов и конфигураций серверов
  - Улучшен интерфейс ServerList.svelte для отображения и выбора серверов
  - Добавлены тесты для servers store
  - Создан тестовый HTML файл для проверки persisted-store

### Коммиты по криптографии и безопасности

- `crypto.ts` (cdac581)
  Добавлена система шифрования для параметров подключения к Home Assistant:
  - Создан `ENCRYPTION_UPGRADE.md` с документацией по улучшениям шифрования
  - Реализованы функции `encryptToken`, `decryptToken`, `encryptServerConfig`, `decryptServerConfig` в `crypto.ts`
  - Добавлены тесты для криптографических функций
  - Интеграция шифрования в `servers.ts` для безопасного хранения токенов

### Исправления и улучшения компонентов

- `Fix: automation actions - use trigger instead of toggle` (b59c529)
  Исправление логики действий автоматизации:
  - В `entity-actions.ts` изменена логика с toggle на trigger для автоматизаций

- `button` (5ca2af5, 1dfaf45)
  Серия коммитов по добавлению поддержки кнопок:
  - Создан `ButtonCard.svelte` для отображения сущностей типа button
  - Улучшены `LightCard.svelte` и `SwitchCard.svelte`
  - Добавлена поддержка кнопок в основную страницу (`+page.svelte`)
  - Обновлены модели сущностей в `entities.ts`

## 2025-12-21 — Начальная настройка проекта и базовые компоненты

### Инициализация проекта и конфигурация

- `123.1` (dffe61f), `123` (16f03f8), `1` (970a056)
  Начальная настройка проекта:
  - Созданы базовые конфигурационные файлы (`config.ts`, `types/index.ts`)
  - Настроен `svelte.config.js` для работы с Svelte 5
  - Добавлены stores для загрузки и уведомлений (`loading.ts`, `notifications.ts`)
  - Настроены зависимости в `package.json`

- `Fix imports: исправлены пути к модулям crypto и config` (9da8b4e)
  Исправление импортов:
  - Исправлены пути импорта в `servers.ts` для корректной работы с crypto и config

### Добавление криптографических функций

- `Add crypto.ts: функции шифрования/дешифрования токенов` (10f54ea)
  Создание системы шифрования:
  - Добавлен `crypto.ts` с функциями шифрования токенов и конфигураций
  - Интеграция с `servers.ts` для безопасного хранения данных

## 2025-12-20 — Начальные коммиты и базовая структура

### Первоначальная настройка

- `12` (211f92f), `1` (1e7705f)
  Начальные коммиты проекта:
  - Создан `AUDIT_REPORT_V2.md` с аудитом проекта
  - Настроены конфигурационные файлы (`package.json`, `vite.config.ts`, `vitest-setup.ts`)
  - Добавлены базовые тесты для HA клиента
  - Улучшен `ServerList.svelte` для управления серверами

## 2025-12-19 — Разработка основных компонентов и функциональности

### Создание карточек сущностей

- `Update UiEntityCard.svelte` (538dbf8)
  - Улучшен базовый компонент для отображения сущностей

- Серия коммитов по карточкам сущностей:
  - `Create InfoCard.svelte`, `Create SensorCard.svelte`, `Create BinaryCard.svelte`
  - `Update LightCard.svelte`, `Update SwitchCard.svelte`, `Update ButtonCard.svelte`
  - Добавлены специализированные компоненты для разных типов сущностей Home Assistant

### Улучшение основной страницы

- Серия коммитов по `+page.svelte`:
  - Добавлена поддержка разных типов сущностей (sensor, switch, light, button)
  - Исправлены ошибки синтаксиса и реактивности
  - Улучшена подписка на изменения сущностей
  - Добавлены действия для управления сущностями

### Исправления и рефакторинг

- `Fix: correct mapStateToUiEntity function name to mapHaStateToUiEntity` (5bc181b)
  - Исправлено название функции в основной странице

- `Fix: remove empty style block from UiEntityCard` (0e42be7)
  - Удален пустой стилевой блок

- `Fix: add label-input association in LightCard (a11y)` (63d3d8e)
  - Улучшена доступность в LightCard

## 2025-12-18 — Инициализация проекта и базовая инфраструктура

### Создание основных файлов проекта

- `Initial commit` (afb52f0)
  - Созданы базовые файлы: `.gitignore`, `LICENSE`, `README.md`

- Серия коммитов по инициализации:
  - `Add Vite configuration`, `Initialize package.json`
  - `Create Evolusion Dashboard page component`
  - `Add EntityCard component`, `Create ServerList component`
  - `Implement HAClient class`, `Add TypeScript types`

### Исправления начальных ошибок

- Серия исправлений:
  - `Fix TypeScript error: Add null check for entities array`
  - `Fix TypeScript error: Remove id duplication in addServer`
  - `Fix package.json JSON syntax error`
  - Исправления синтаксиса в `+page.svelte` и `ha-client.ts`
