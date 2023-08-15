import { z } from "zod";

export const AquariumDtoSchema = z.object({
    id: z.string().uuid().nullable(),
    name: z.string().min(1),
    description: z.string().min(1),
    startedDate: z.date(),
    volume: z.number(),
    salt: z.boolean(),
    imageUrl: z.string(),
    image: z.any(),
    archivedDate: z.date().nullable(),
});
export type AquariumDto = z.infer<typeof AquariumDtoSchema>;

export const extractAquariumDto = ({
    id,
    name,
    description,
    startedDate,
    volume,
    salt,
    imageUrl,
    image,
    archivedDate,
}: AquariumDto) => {
    return {
        id,
        name,
        description,
        startedDate,
        volume,
        salt,
        imageUrl,
        image,
        archivedDate,
    };
};
