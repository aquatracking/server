import { z } from "zod";
import { BiotopeUpdateDtoSchema } from "../biotope/BiotopeUpdateDto";

export const TerrariumUpdateDtoSchema = BiotopeUpdateDtoSchema.and(
    z
        .object({
            wet: z.boolean(),
        })
        .partial(),
);

export type TerrariumUpdateDto = z.infer<typeof TerrariumUpdateDtoSchema>;
