import { z } from "zod";
import { BiotopeCreateDtoSchema } from "../biotope/BiotopeCreateDto";

export const AquariumCreateDtoSchema = BiotopeCreateDtoSchema.and(
    z.object({
        volume: z.number(),
        salt: z.boolean().optional(),
    }),
);

export type AquariumCreateDto = z.infer<typeof AquariumCreateDtoSchema>;
