import { z } from "zod";
import { UserDtoSchema } from "../user/userDto";

export const ApplicationTokenDtoSchema = z.object({
    name: z.string(),
    description: z.string(),
    user: UserDtoSchema,
});

export type ApplicationTokenDto = z.infer<typeof ApplicationTokenDtoSchema>;
