// Типы и схемы валидации
import { z } from 'zod';

export const ServerConfigSchema = z.object({
  id: z.string().uuid('Невалидный ID сервера'),
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное'),
  url: z.string().url('Неверный формат URL'),
  accessToken: z.string().min(10, 'Токен слишком короткий'),
  verifySsl: z.boolean().default(true)
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}
