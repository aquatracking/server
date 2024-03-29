import { z } from "zod";
import { BiotopeUpdateDtoSchema } from "../biotope/BiotopeUpdateDto";

export const AquariumUpdateDtoSchema = BiotopeUpdateDtoSchema.and(
    z
        .object({
            salt: z.boolean(),
        })
        .partial(),
);

export type AquariumUpdateDto = z.infer<typeof AquariumUpdateDtoSchema>;
