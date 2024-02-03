import { z } from "zod";
import ApplicationModel from "../../model/ApplicationModel";

export const ApplicationDtoSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
});

export type ApplicationDto = z.infer<typeof ApplicationDtoSchema>;
