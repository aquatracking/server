import { z } from "zod";

export const UserDtoSchema = z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string().email(),
});

export type UserDto = z.infer<typeof UserDtoSchema>;

/**
 * Extract a UserDto from an object similar to the type UserDto
 **/
export const extractUserDto = ({ id, username, email }: UserDto) => {
    return { id, username, email };
};
