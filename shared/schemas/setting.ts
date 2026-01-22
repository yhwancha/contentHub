import { z } from 'zod';

export const SettingSchema = z.object({
  key: z.string(),
  value: z.string(),
  updatedAt: z.string().datetime(),
});

export type Setting = z.infer<typeof SettingSchema>;

export const UpdateIntervalSchema = z.object({
  minutes: z.number().int().min(1).max(10080), // 1 minute to 1 week
});

export type UpdateInterval = z.infer<typeof UpdateIntervalSchema>;

export const SettingsResponseSchema = z.object({
  settings: z.record(z.string(), z.string()),
});

export type SettingsResponse = z.infer<typeof SettingsResponseSchema>;
