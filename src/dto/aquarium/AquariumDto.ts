import { z } from "zod";

export const AquariumDtoSchema = z
    .object({
        id: z.string().uuid(),
        name: z.string(),
        description: z.string(),
        startedDate: z.date(),
        volume: z.number(),
        salt: z.boolean(),
        imageUrl: z.string().default(""),
        archivedDate: z.date().optional().nullable(),
    })
    .transform((data) => {
        return {
            ...data,
            imageUrl: `/aquariums/${data.id}/image`,
        };
    });

export type AquariumDto = z.infer<typeof AquariumDtoSchema>;
