import { z } from "zod";

export const BiotopeUpdateDtoSchema = z
    .object({
        name: z.string().min(1).max(100),
        description: z.string().max(255),
        startedDate: z.coerce.date(),
        image: z
            .number()
            .array()
            .refine(
                (value) => {
                    return value.length < 1_000_000;
                },
                {
                    message: "Image size must be less than 1MB",
                    path: ["image"],
                },
            )
            .optional()
            .nullable(),
        volume: z.number().nullable(),
    })
    .partial();

export type BiotopeUpdateDto = z.infer<typeof BiotopeUpdateDtoSchema>;
