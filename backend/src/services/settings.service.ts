import { prisma } from '../lib/prisma.js';

const DEFAULT_INGEST_INTERVAL_MINUTES = 180;

export async function getValue(key: string): Promise<string | null> {
  const setting = await prisma.setting.findUnique({
    where: { key },
  });
  return setting?.value ?? null;
}

export async function getIngestIntervalMinutes(): Promise<number> {
  const value = await getValue('ingest_interval_minutes');
  if (!value) {
    return DEFAULT_INGEST_INTERVAL_MINUTES;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? DEFAULT_INGEST_INTERVAL_MINUTES : parsed;
}

export async function updateValue(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function updateIngestInterval(minutes: number): Promise<void> {
  if (minutes < 1 || minutes > 10080) {
    throw new Error('Interval must be between 1 and 10080 minutes');
  }
  await updateValue('ingest_interval_minutes', String(minutes));
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany();
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

export const settingsService = {
  getValue,
  getIngestIntervalMinutes,
  updateValue,
  updateIngestInterval,
  getAllSettings,
};
