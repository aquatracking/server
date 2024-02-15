import { z } from "zod";
import { BiotopeCreateDtoSchema } from "../biotope/BiotopeCreateDto";

export const TerrariumCreateDtoSchema = BiotopeCreateDtoSchema.and(
    z.object({
        wet: z.boolean().optional(),
    }),
);

export type TerrariumCreateDto = z.infer<typeof TerrariumCreateDtoSchema>;
