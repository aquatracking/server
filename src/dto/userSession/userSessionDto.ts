import { z } from "zod";

export const UserSessionDtoSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    firstConnectionDate: z.date(),
    lastConnectionDate: z.date(),
    current: z.boolean().optional(),
});

export type UserSessionDto = z.infer<typeof UserSessionDtoSchema>;
