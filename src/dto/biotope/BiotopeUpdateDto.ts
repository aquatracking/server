import { z } from "zod";

export const BiotopeUpdateDtoSchema = z
    .object({
        name: z.string().min(1).max(100),
        description: z.string().max(255),
        startedDate: z.coerce.date(),
        image: z.custom<Blob>(),
        volume: z.number(),
    })
    .partial();

export type BiotopeUpdateDto = z.infer<typeof BiotopeUpdateDtoSchema>;
