import { z } from "zod";

export const AdminUserUpdateDtoSchema = z.object({
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).max(100).optional(),
    isAdmin: z.boolean().optional(),
});

export type AdminUserUpdateDto = z.infer<typeof AdminUserUpdateDtoSchema>;
