import { z } from "zod";
import { BiotopeDtoSchema } from "../biotope/BiotopeDto";

export const AquariumDtoSchema = BiotopeDtoSchema.and(
    z.object({
        salt: z.boolean(),
    }),
).transform((data) => {
    return {
        ...data,
        imageUrl: `/aquariums/${data.id}/image`,
    };
});

export type AquariumDto = z.infer<typeof AquariumDtoSchema>;
