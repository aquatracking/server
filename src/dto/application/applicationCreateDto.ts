import { z } from "zod";

export const ApplicationCreateDtoSchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().max(255).optional(),
});

export type ApplicationCreateDto = z.infer<typeof ApplicationCreateDtoSchema>;
