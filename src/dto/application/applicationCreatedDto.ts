import { z } from "zod";
import ApplicationModel from "../../model/ApplicationModel";

export const ApplicationCreatedDtoSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    token: z.string(),
});

export type ApplicationDto = z.infer<typeof ApplicationCreatedDtoSchema>;
