import { z } from "zod";

export const AdminUserCreateDtoSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    isAdmin: z.boolean().optional(),
});

export type AdminUserCreateDto = z.infer<typeof AdminUserCreateDtoSchema>;
