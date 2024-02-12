import { z } from "zod";
import { BiotopeDtoSchema } from "../biotope/BiotopeDto";

export const AquariumDtoSchema = BiotopeDtoSchema.and(
    z.object({
        volume: z.number(),
        salt: z.boolean(),
    }),
);

export type AquariumDto = z.infer<typeof AquariumDtoSchema>;
