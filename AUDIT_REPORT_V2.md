# Аудит кодовой базы проекта Evolusion (Home Assistant Frontend)

**Версия: 2.0** – Новые рекомендации для рефакторинга

---

## Файл сгенерирован

- **Дата аудита:** 20 декабря 2025
- **Версия проекта:** 0.1.0
- **Технология:** SvelteKit 2.0, TypeScript 5.0, Vite 5.0
- **Оценка:** 4.3/10 → **Цель: 7.5/10 после рефакторинга**

---

## Обзор найденных проблем

| Категория | Кол-во | Гравитет | Состояние |
|----|----|----|----|
| **Критические** | 4 | ὓ4 Critical | Must fix ASAP |
| **Основные** | 8 | 🟠 High | Fix in Sprint 1 |
| **Низкие** | 6 | 🟡 Medium | Backlog |

---

## 🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ (НТ 4 ШТ.)

### 🔐 1. Открытые токены в localStorage

**Файл:** `src/lib/stores/servers.ts:69`
**Риск:** CRITICAL - Полная компрометация аккаунтов

```typescript
// НЕПОРАВНО
 localStorage.setItem('ha_servers', JSON.stringify(value)); // Токены в plain text!
```

**Понятие риска:**
- localStorage доступен любому JS-коду на странице
- XSS-атака на странице имеет полный акцесс к токенам
- все пароли видны в DevTools

**ОПТНУЕ: РЕКОМЕНДАЦИОННОЕ РЕШЕНИЕ:**

```bash
npm install @noble/ciphers
```

```typescript
// src/lib/utils/crypto.ts
import { xchacha20poly1305 } from '@noble/ciphers/aead';

const SECRET_KEY = new Uint8Array(32); // использовать ключ из env

export function encryptToken(token: string): string {
  const nonce = crypto.getRandomValues(new Uint8Array(24));
  const encrypted = xchacha20poly1305(SECRET_KEY, nonce).encrypt(
    new TextEncoder().encode(token)
  );
  return btoa(String.fromCharCode(...nonce) + String.fromCharCode(...encrypted));
}

export function decryptToken(encrypted: string): string {
  const decoded = atob(encrypted);
  const nonce = new Uint8Array(decoded.charCodeAt(0), ...[...decoded].slice(0, 24).map(c => c.charCodeAt(0)));
  const ciphertext = new Uint8Array([...decoded].slice(24).map(c => c.charCodeAt(0)));
  const decrypted = xchacha20poly1305(SECRET_KEY, nonce).decrypt(ciphertext);
  return new TextDecoder().decode(decrypted);
}
```

---

### 🔴 2. Отсутствие обычных обработок ошибок

**Файл:** `src/lib/stores/servers.ts:65`
**Проблема:** client.connect().catch(console.error) - ошибки тихо игнорируются

```typescript
// ПЛОХО
 client.connect().catch(console.error);
```

**ПОСЛЕДСТВИЕ:**
- Пользователь не знает про ошибки подключения
- Апликация частично работает без ответных видимых отказов

**РОБОЧЕНИЕ:**

```typescript
// src/lib/stores/servers.ts
export const serverActions = {
  async connect(serverId: string, config: ServerConfig) {
    try {
      const client = createHAClient(config);
      await client.connect();
      setConnectionStatus(serverId, 'connected');
      
      // Уведомлять пользователя
      showNotification({
        type: 'success',
        title: 'Успешно подключено',
        message: `Подключение к ${config.name} успешно`
      });
      
      return { success: true, client };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      setConnectionStatus(serverId, 'error');
      showNotification({
        type: 'error',
        title: 'Ошибка подключения',
        message,
        duration: 5000
      });
      
      console.error(`[HA Client] Ошибка подключения к ${config.name}:`, error);
      return { success: false, error: message };
    }
  }
};
```

---

### 🔴 3. Нет валидации данных из localStorage

**Файл:** `src/lib/stores/servers.ts`

**Проблема:** Данные никогда не валидируются - является источником роЃтайм ошибок

```bash
npm install zod
```

```typescript
// src/lib/types/index.ts
import { z } from 'zod';

export const ServerConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Имя обязательно'),
  url: z.string().url('Неверный URL'),
  accessToken: z.string().min(10, 'Невалидный токен'),
  verifySsl: z.boolean().default(true)
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

// src/lib/stores/servers.ts
export function loadServersFromStorage(): ServerConfig[] {
  try {
    const stored = localStorage.getItem('ha_servers');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Валидируем каждый сервер
    const validated = z.array(ServerConfigSchema).parse(parsed);
    return validated;
  } catch (error) {
    console.error('Ошибка при загружении серверов из склада:', error);
    // Очистить поврежденные данные
    localStorage.removeItem('ha_servers');
    return [];
  }
}
```

---

### 🔴 4. Утечка памяти в компонентах

**Файл:** `src/routes/+page.svelte`

**Проблема:** Нет очистки ресурсов при унмонтировании

```typescript
<script lang="ts">
  import { onDestroy } from 'svelte';
  
  let unsubscribe: (() => void) | null = null;
  
  onMount(() => {
    // Подписываемся на изменения
    unsubscribe = servers.subscribe((value) => {
      // ...
    });
    
    // Указать interval / timeout
    const interval = setInterval(() => {
      // ...
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  });
  
  // ОриПО ОЧИСТКА ПО УНМОНТИРОВАНИИ
  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>
```

---

## 💜 ОСНОВНЫЕ ПРОБЛЕМЫ (НТ 8 ШТ.)

### 🐉 5. Отсутствие offline режима

**Необходимо:**
- Кэширование данных
- Service Worker
- Очередь синхронизации

```bash
npm install workbox-cli
npm install -D workbox-precaching
```

**ОриО время имплементации:** 2-3 дня

---

### 🐉 6. Нет индикаторов загрузки

**Проблема:** Пользователь дю знает, когда операция выполняется

```bash
npm install nprogress
npm install -D @types/nprogress
```

```typescript
// src/lib/stores/loading.ts
import { writable } from 'svelte/store';
import NProgress from 'nprogress';

export const isLoading = writable(false);
export const progress = writable(0);

export function startLoading() {
  isLoading.set(true);
  NProgress.start();
}

export function stopLoading() {
  isLoading.set(false);
  NProgress.done();
}

export function setProgress(value: number) {
  progress.set(value);
  NProgress.set(value);
}
```

---

### 🐉 7. Несогласованные импорты

**Проблема:**
- `import { ... } from './utils'` с друг них разделов
- `import { ... } from '../../../utils'` в добок какоято

**РЕШЕНИЕ:**

```js
// svelte.config.js
const config = {
  kit: {
    alias: {
      '$lib': 'src/lib',
      '$components': 'src/lib/components',
      '$stores': 'src/lib/stores',
      '$utils': 'src/lib/utils',
      '$types': 'src/lib/types',
      '$constants': 'src/lib/constants'
    }
  }
};
```

**ТОЛЬКО ПОсле этого:**
```typescript
// Выв вместодт: import { utils } from '../../../utils';
import { utils } from '$utils';
```

---

### 🐉 8. Нет тестов

**Проблема:** 0% нокрытия тестами

```bash
# Настроить vitest
npm install -D vitest @vitest/ui @testing-library/svelte
```

```typescript
// src/lib/stores/__tests__/servers.test.ts
import { describe, it, expect } from 'vitest';
import { loadServersFromStorage } from '../servers';

describe('servers store', () => {
  it('должны возвратить пустой массив если данные повреждены', () => {
    localStorage.setItem('ha_servers', '{ invalid json }');
    const result = loadServersFromStorage();
    expect(result).toEqual([]);
  });
});
```

---

### 🐉 9. Не настроен ESLint / Prettier

```bash
npm install -D eslint prettier eslint-config-prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:svelte/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte']
  },
  env: {
    browser: true,
    es2020: true,
    node: true
  }
};
```

---

### 🐉 10. Магические строки и номера

**Гравитет:** Медиум

```typescript
// ПЛОХО
setTimeout(() => {
  // ...
}, 5000); // Магическое число

// ХОРОШО
const RECONNECT_INTERVAL_MS = 5000; // 5 секунд
setTimeout(() => {
  // ...
}, RECONNECT_INTERVAL_MS);
```

```typescript
// src/lib/constants/config.ts
export const CONFIG = {
  RECONNECT_INTERVAL_MS: 5000,
  MAX_RETRIES: 3,
  STORAGE_KEY: 'ha_servers',
  REQUEST_TIMEOUT_MS: 30000,
  SESSION_DURATION_MS: 24 * 60 * 60 * 1000 // 24 hours
};
```

---

## 💛 НОВЫЕ архитектурные рекомендации

### 📁 Организация файлов

```
src/
  ├── lib/
  │   ├── api/              # API и сокеты
  │   │   ├── ha-client.ts
  │   │   ├── connection.ts
  │   │   └── reconnect.ts
  │   │
  │   ├── stores/           # Svelte stores (состояние)
  │   │   ├── servers.ts
  │   │   ├── loading.ts
  │   │   └── notifications.ts
  │   │
  │   ├── services/         # Бизнес-логика и гаджеты
  │   │   ├── auth.service.ts
  │   │   ├── server.service.ts
  │   │   └── entity.service.ts
  │   │
  │   ├── components/       # Svelte компоненты
  │   │   ├── EntityCard.svelte
  │   │   ├── ServerList.svelte
  │   │   └── LoadingSpinner.svelte
  │   │
  │   ├── utils/           # Утилиты
  │   │   ├── crypto.ts
  │   │   ├── format.ts
  │   │   └── validation.ts
  │   │
  │   ├── constants/       # Константы
  │   │   ├── config.ts
  │   │   └── messages.ts
  │   │
  │   └── types/           # TypeScript типы
  │       └── index.ts
  │
  └── routes/
      └── +page.svelte
```

---

## 📅 TIMELINE и ROADMAP для рефакторинга

### Учитывая 2-3 недели (финиш в production-ready)

#### ДЕНЬ 1-2: Критическая безопасность (Priority 1)

- [ ] Установить @noble/ciphers для шифрования токенов
- [ ] Создать src/lib/utils/crypto.ts с функциями зашифровки/дешифровки
- [ ] Обновить src/lib/stores/servers.ts для использования зашифрованных токенов
- [ ] Установить zod для валидации

#### ДЕНЬ 3-4: Обычная обработка ошибок

- [ ] Травверсировать все .catch блоки
- [ ] Установить нотификационные модальные для осхибкам
- [ ] Создать src/lib/stores/notifications.ts для отображения ошибок

#### ДЕНЬ 5: Тинстроментация

- [ ] Настроить ESLint, Prettier, vitest
- [ ] Написать первые unit-тесты

#### УНЕДЕЛИ 2-3: Архитектура и офтимизация

- [ ] Переструктурировать файлы на services layer
- [ ] Сохранить alias для импортов
- [ ] Написать несколько интеграционных тестов
- [ ] Настроить offline mode и Service Worker

#### ВИДЕНД: Production Release

- [ ] Тестирование на реальных данных
- [ ] Документирование API
- [ ] Сохранить v1.0.0 тэг

---

## 🚀 Quick Wins (Что делать управи дней)

### 1. Setup GitHub Actions для тестов (30 мин)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test
      - run: npm run lint
```

### 2. Добавить обработку ошибок UI (1 день)

```svelte
<!-- src/lib/components/ErrorBoundary.svelte -->
<script>
  let error: Error | null = null;
  
  onError((err) => {
    error = err;
    console.error('Error boundary caught:', err);
  });
</script>

{#if error}
  <div class="error-toast">
    <p>Ошибка: {error.message}</p>
    <button on:click={() => (error = null)}>Close</button>
  </div>
{/if}

<slot />
```

### 3. Добавить constants файл (30 мин)

```typescript
// src/lib/constants/config.ts
export const CONFIG = {
  RECONNECT_INTERVAL_MS: 5000,
  MAX_RETRIES: 3,
  STORAGE_KEY: 'ha_servers_v2',
  REQUEST_TIMEOUT_MS: 30000
};
```

---

## ✅ КРИТерии НОВОГО SUCCESS

| Метрика | Показатель | Результат |
|----------|--------|--------|
| Test Coverage | > 60% | ✅ |
| ESLint errors | 0 | ✅ |
| Type errors | 0 | ✅ |
| Security issues | 0 | ✅ |
| Bundle size | < 100KB | ✅ |
| Lighthouse score | > 80 | ✅ |

---

**Официальные стандарты:** SvelteKit, TypeScript, ESLint, Prettier

*Модификация автоматически генерирована 20 декабря 2025*