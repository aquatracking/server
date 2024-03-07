import * as dotenv from "dotenv";
import Fastify from "fastify";
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
} from "fastify-type-provider-zod";
import fs from "fs";
import cron from "node-cron";
import { isApplicationLoggedIn } from "./auth/isApplicationLoggedIn";
import { isSessionLoggedIn } from "./auth/isSessionLoggedIn";
import { ensureValidEnv, env } from "./env";
import { BiotopeModel } from "./model/BiotopeModel";
import { EmailValidationOTPModel } from "./model/EmailValidationOTPModel";
import { MeasurementTypeModel } from "./model/MeasurementTypeModel";
import { UserModel } from "./model/UserModel";
import Db from "./model/db";
import { isEmailValidated } from "./auth/isEmailValidated";

// - - - - - Environment variables - - - - - //
if (fs.existsSync(".env")) {
    console.log("Using .env file to supply config environment variables");
    dotenv.config();
} else {
    console.log(".env file not found, creating one with default values");

    fs.copyFileSync(".env.example", ".env");

    console.log("Please complete the .env file");

    process.exit(1);
}

ensureValidEnv();

declare module "fastify" {
    export interface FastifyRequest {
        user?: UserModel;
        biotope?: BiotopeModel;
        measurementType?: MeasurementTypeModel;
    }
}

(async () => {
    // - - - - - Database - - - - - //
    console.log("Connecting to database...");
    Db.init()
        .catch((err) => {
            console.error(err);
            process.exit(1);
        })
        .then(async () => {
            console.log("Database connected.");
        });

    console.log("Starting server...");
    const fastify = Fastify({
        logger: true,
    });

    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    // Set up swagger
    await fastify.register(import("@fastify/swagger"), {
        openapi: {
            info: {
                title: "Aquatracking API",
                version: "1.0.0",
            },
            tags: [
                {
                    name: "auth",
                    description: "Authentication and registration",
                },
                {
                    name: "users",
                    description: "Users management",
                },
                {
                    name: "aquariums",
                    description: "Aquariums management",
                },
                {
                    name: "applications",
                    description: "API applications management",
                },
            ],
        },
        transform: jsonSchemaTransform,
    });
    await fastify.register(import("@fastify/swagger-ui"), {
        routePrefix: "/documentation",
    });

    const port = Number.parseInt(env.PORT.toString());
    fastify.listen({ port: port }, () => {
        console.log(`Server started on port ${port}.`);
    });

    // - - - - - Authentication Middleware - - - - - //
    fastify.decorateRequest("user", undefined);
    await fastify.register(import("@fastify/auth"), {
        defaultRelation: "or",
    });

    await fastify.register(import("@fastify/cookie"));

    // - - - - - Routes - - - - - //
    await fastify.register(import("./routes/auth"), {
        prefix: "/auth",
    });

    await fastify.register(async (instance) => {
        instance.addHook(
            "preHandler",
            instance.auth([isSessionLoggedIn, isApplicationLoggedIn]),
        );

        await fastify.register(import("./routes/users/me"), {
            prefix: "/users/me",
        });

        instance.register(async (instance) => {
            instance.addHook("preHandler", instance.auth([isEmailValidated]));

            await fastify.register(import("./routes/applications"), {
                prefix: "/applications",
            });

            await fastify.register(import("./routes/biotopes/aquariums"), {
                prefix: "/aquariums",
            });

            await fastify.register(import("./routes/biotopes/terrariums"), {
                prefix: "/terrariums",
            });
        });
    });

    // - - - - - Setup cron jobs - - - - - //
    // Every day at 00:00
    cron.schedule("0 0 * * *", () => {
        EmailValidationOTPModel.destroyExpiredTokens();
    });
})();
