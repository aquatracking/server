import { z } from "zod";

export const ApplicationCreatedDtoSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    token: z.string(),
});

export type ApplicationDto = z.infer<typeof ApplicationCreatedDtoSchema>;
