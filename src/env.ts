import { z } from "zod";

const portSchema = z
    .preprocess(
        (value) => {
            const port = parseInt(String(value), 10);

            if (isNaN(port)) {
                // named pipe
                return value;
            }

            if (port >= 0) {
                // port number
                return port;
            }

            return false;
        },
        z.union([
            z.number().positive().safe().finite(),
            z.string(),
            z.literal(false),
        ]),
    )
    .default("3000");

const servicePortSchema = z.preprocess(
    (value) => Number(value),
    z.number().positive().safe().finite(),
);

const envSchema = z.object({
    PORT: portSchema,
    MARIADB_HOST: z.string().min(1),
    MARIADB_PORT: servicePortSchema,
    MARIADB_USER: z.string().min(1),
    MARIADB_PASSWORD: z.string(),
    MARIADB_DATABASE: z.string().min(1),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    APPLICATION_TOKEN_SECRET: z.string().min(1),
    MAIL_HOST: z.string().min(1),
    MAIL_PORT: servicePortSchema,
    MAIL_USER: z.string().min(1),
    MAIL_PASS: z.string(),
    MAIL_SSL: z
        .preprocess((value) => value === true, z.boolean())
        .default("false"),
    REGISTRATION_ENABLED: z.preprocess(
        (value) => value === "true",
        z.boolean(),
    ),
});

export type Env = z.infer<typeof envSchema>;
export const env = envSchema.parse(process.env);
