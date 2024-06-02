import { z } from "zod";

export const BiotopeCreateDtoSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(255).optional(),
    startedDate: z.coerce.date().optional(),
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
    volume: z.number().optional().nullable(),
});

export type BiotopeCreateDto = z.infer<typeof BiotopeCreateDtoSchema>;
