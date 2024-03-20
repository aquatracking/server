import { z } from "zod";

export const UserCreateDtoSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

export type UserCreateDto = z.infer<typeof UserCreateDtoSchema>;
