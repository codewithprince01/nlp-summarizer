import { z } from 'zod';

export const createReportSchema = z.object({
  sourceType: z.enum(['text', 'image']),
  text: z.string().max(20000).optional(),
});
