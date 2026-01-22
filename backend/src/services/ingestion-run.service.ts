import { prisma } from '../lib/prisma.js';
import type { IngestionRun, IngestionStatus } from '@prisma/client';

export async function createRun(): Promise<IngestionRun> {
  return prisma.ingestionRun.create({
    data: {
      startedAt: new Date(),
      status: 'running',
    },
  });
}

export async function completeRun(
  id: string,
  status: IngestionStatus,
  newCount: number,
  updatedCount: number,
  errorMessage?: string
): Promise<IngestionRun> {
  return prisma.ingestionRun.update({
    where: { id },
    data: {
      finishedAt: new Date(),
      status,
      newCount,
      updatedCount,
      errorMessage,
    },
  });
}

export async function getLastSuccessfulRun(): Promise<IngestionRun | null> {
  return prisma.ingestionRun.findFirst({
    where: { status: 'success' },
    orderBy: { startedAt: 'desc' },
  });
}

export async function isRunning(): Promise<boolean> {
  const runningRun = await prisma.ingestionRun.findFirst({
    where: { status: 'running' },
  });
  return runningRun !== null;
}

export const ingestionRunService = {
  createRun,
  completeRun,
  getLastSuccessfulRun,
  isRunning,
};
