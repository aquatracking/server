import { z } from "zod";
import { BiotopeDtoSchema } from "../biotope/BiotopeDto";

export const TerrariumDtoSchema = BiotopeDtoSchema.and(
    z.object({
        wet: z.boolean(),
    }),
).transform((data) => {
    return {
        ...data,
        imageUrl: `/terrariums/${data.id}/image`,
    };
});

export type TerrariumDto = z.infer<typeof TerrariumDtoSchema>;
