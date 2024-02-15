import { z } from "zod";

export const BiotopeDtoSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    startedDate: z.date(),
    imageUrl: z.string().default(""),
    archivedDate: z.date().optional().nullable(),
    volume: z.number().optional().nullable(),
});

export type BiotopeDto = z.infer<typeof BiotopeDtoSchema>;
