import * as dotenv from "dotenv";
import fs from "fs";

import Fastify from "fastify";

import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
} from "fastify-type-provider-zod";
import { ensureValidEnv, env } from "./env";
import Db from "./model/db";

import { isApplicationLoggedIn } from "./auth/isApplicationLoggedIn";
import { isSessionLoggedIn } from "./auth/isSessionLoggedIn";
import { BiotopeModel } from "./model/BiotopeModel";
import { MeasurementTypeModel } from "./model/MeasurementTypeModel";
import { UserModel } from "./model/UserModel";

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

// - - - - - Serveur Express - - - - - //
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

        await fastify.register(import("./routes/users"), {
            prefix: "/users",
        });

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
})();
