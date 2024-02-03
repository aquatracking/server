import { z } from "zod";

export const AquariumUpdateDtoSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().min(0).max(1000).optional(),
    startedDate: z.coerce.date().optional(),
    volume: z.number().optional(),
    salt: z.boolean().optional(),
    image: z.custom<Blob>().optional(),
});

export type AquariumUpdateDto = z.infer<typeof AquariumUpdateDtoSchema>;
