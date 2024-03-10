import { z } from "zod";

export const AdminUserDtoSchema = z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string().email(),
    verified: z.boolean(),
    totpEnabled: z.boolean(),
    isAdmin: z.boolean(),
    deleteAt: z.date().nullable(),
});

export type UserDto = z.infer<typeof AdminUserDtoSchema>;
