import { z } from "zod";

export const BiotopeCreateDtoSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(0).max(1000).optional(),
    startedDate: z.coerce.date().optional(),
    image: z.custom<Blob>().optional(),
    volume: z.number().optional(),
});

export type BiotopeCreateDto = z.infer<typeof BiotopeCreateDtoSchema>;
