import { z } from "zod";

export type Env = z.infer<typeof dotEnvSchema>;
export let env: Env;

export const ensureValidEnv = () => {
  const result = dotEnvSchema.safeParse(process.env);
  // !result.success does not work
  // because strict mode is not enabled
  if (result.success === false) {
    const errors = result.error.format();

    const finalErrors = Object.entries(errors)
      .filter(([key]) => !key.startsWith("_"))
      .map(
        ([key, errors]) =>
          `${key} -> ${(Array.isArray(errors) ? errors : errors._errors).join(
            ", "
          )}`
      );
    console.error("The .env file is not valid:\n", finalErrors.join("\n"));
    process.exit(1);
  }

  env = result.data;
};

const portSchema = z
  .preprocess((value) => {
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
  }, z.union([z.number().positive().safe().finite(), z.string(), z.literal(false)]))
  .default("3000");

const servicePortSchema = z.preprocess(
  (value) => Number(value),
  z.number().positive().safe().finite()
);

const dotEnvSchema = z.object({
  PORT: portSchema,
  MARIADB_HOST: z.string().nonempty(),
  MARIADB_PORT: servicePortSchema,
  MARIADB_USER: z.string().nonempty(),
  MARIADB_PASSWORD: z.string(),
  MARIADB_DATABASE: z.string().nonempty(),
  ACCESS_TOKEN_SECRET: z.string().nonempty(),
  REFRESH_TOKEN_SECRET: z.string().nonempty(),
  APPLICATION_TOKEN_SECRET: z.string().nonempty(),
  MAIL_HOST: z.string().nonempty(),
  MAIL_PORT: servicePortSchema,
  MAIL_USER: z.string().nonempty(),
  MAIL_PASS: z.string(),
  MAIL_SSL: z
    .preprocess((value) => Boolean(value), z.boolean())
    .default("false"),
  REGISTRATION_ENABLED: z.preprocess((value) => Boolean(value), z.boolean()),
});
