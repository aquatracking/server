import { z } from "zod";

export const UserDtoSchema = z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string().email(),
    verified: z.boolean(),
});

export type UserDto = z.infer<typeof UserDtoSchema>;
