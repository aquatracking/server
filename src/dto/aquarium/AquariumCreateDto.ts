import { z } from "zod";

export const AquariumCreateDtoSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(0).max(1000).optional(),
    startedDate: z.coerce.date().optional(),
    volume: z.number(),
    salt: z.boolean().optional(),
    image: z.custom<Blob>().optional(),
});

export type AquariumCreateDto = z.infer<typeof AquariumCreateDtoSchema>;
