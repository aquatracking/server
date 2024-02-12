import { z } from "zod";

export const BiotopeUpdateDtoSchema = z
    .object({
        name: z.string().min(1).max(100),
        description: z.string().min(0).max(1000),
        startedDate: z.coerce.date(),
        image: z.custom<Blob>(),
    })
    .partial();

export type BiotopeUpdateDto = z.infer<typeof BiotopeUpdateDtoSchema>;
