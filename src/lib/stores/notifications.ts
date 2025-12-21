// Store для уведомлений
import { writable } from 'svelte/store';
import type { NotificationOptions } from '../types';

export interface Notification extends NotificationOptions {
  id: string;
  timestamp: number;
}

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([]);

  return {
    subscribe,
    show: (options: NotificationOptions) => {
      const notification: Notification = {
        ...options,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        duration: options.duration ?? 3000
      };

      update(notifications => [...notifications, notification]);

      // Автоматически удаляем уведомление через указанное время
      if (notification.duration > 0) {
        setTimeout(() => {
          update(notifications => 
            notifications.filter(n => n.id !== notification.id)
          );
        }, notification.duration);
      }

      return notification.id;
    },
    dismiss: (id: string) => {
      update(notifications => notifications.filter(n => n.id !== id));
    },
    clear: () => {
      update(() => []);
    }
  };
}

export const notifications = createNotificationStore();
