import { z } from 'zod';

const CursorSchema = z.object({
  publishedAt: z.string(),
  id: z.string(),
});

type Cursor = z.infer<typeof CursorSchema>;

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

export function decodeCursor(encoded: string): Cursor | null {
  try {
    const decoded = Buffer.from(encoded, 'base64url').toString('utf-8');
    const parsed = JSON.parse(decoded);
    return CursorSchema.parse(parsed);
  } catch {
    return null;
  }
}

export function createCursor(publishedAt: Date, id: string): string {
  return encodeCursor({
    publishedAt: publishedAt.toISOString(),
    id,
  });
}
