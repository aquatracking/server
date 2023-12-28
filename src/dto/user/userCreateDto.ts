import { z } from "zod";

export const UserCreateDtoSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
});

export type UserCreateDto = z.infer<typeof UserCreateDtoSchema>;
