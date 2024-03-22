import Fastify from "fastify";
import {
    ZodTypeProvider,
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
} from "fastify-type-provider-zod";
import cron from "node-cron";
import { isAdminLoggedIn } from "./auth/isAdminLoggedIn";
import { isApplicationLoggedIn } from "./auth/isApplicationLoggedIn";
import { isEmailValidated } from "./auth/isEmailValidated";
import { isSessionLoggedIn } from "./auth/isSessionLoggedIn";
import { env } from "./env";
import { ApiError } from "./errors/ApiError/ApiError";
import { EmailNotValidatedApiError } from "./errors/ApiError/EmailNotValidatedApiError";
import { NotLoggedApiError } from "./errors/ApiError/NotLoggedApiError";
import { UserNotAdminApiError } from "./errors/ApiError/UserNotAdminApiError";
import { BiotopeModel } from "./model/BiotopeModel";
import { EmailValidationOTPModel } from "./model/EmailValidationOTPModel";
import { MeasurementTypeModel } from "./model/MeasurementTypeModel";
import { UserModel } from "./model/UserModel";
import { UserSessionModel } from "./model/UserSessionModel";
import Db from "./model/db";
import { injectSchemaInRouteOption } from "./utils/routeOptionInjection";

declare module "fastify" {
    export interface FastifyRequest {
        user?: UserModel;
        session?: UserSessionModel;
        biotope?: BiotopeModel;
        measurementType?: MeasurementTypeModel;
    }
}

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

// - - - - - Server - - - - - //
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

// - - - - - Rate limiting - - - - - //
await fastify.register(import("@fastify/rate-limit"), {});

// - - - - - Error handling - - - - - //
fastify
    .withTypeProvider<ZodTypeProvider>()
    .setErrorHandler((error, request, reply) => {
        const finalError = {
            statusCode: 500,
            error: "Internal Server Error",
            code: "INTERNAL_SERVER_ERROR",
            data: undefined as unknown,
        };

        if (error instanceof ApiError) {
            finalError.statusCode = error.statusCode;
            finalError.error = error.error;
            finalError.code = error.code;
            finalError.data = error.data;
        }

        if (error.statusCode === 429) {
            finalError.statusCode = 429;
            finalError.error = "Too Many Requests";
            finalError.code = "TOO_MANY_REQUESTS";
        }

        return reply.status(finalError.statusCode).send(finalError);
    });

// - - - - - Routes - - - - - //
await fastify.register(import("./routes/auth"), {
    prefix: "/auth",
});

await fastify.register(async (instance) => {
    instance.addHook(
        "preHandler",
        instance.auth([isSessionLoggedIn, isApplicationLoggedIn]),
    );

    instance.addHook("onRoute", (routeOptions) => {
        injectSchemaInRouteOption(routeOptions, 401, NotLoggedApiError.schema);
    });

    await fastify.register(import("./routes/users/me"), {
        prefix: "/users/me",
    });

    instance.register(async (instance) => {
        instance.addHook("preHandler", instance.auth([isEmailValidated]));

        instance.addHook("onRoute", (routeOptions) => {
            injectSchemaInRouteOption(
                routeOptions,
                403,
                EmailNotValidatedApiError.schema,
            );
        });

        await fastify.register(import("./routes/applications"), {
            prefix: "/applications",
        });

        await fastify.register(import("./routes/measurementTypes"), {
            prefix: "/measurementTypes",
        });

        await fastify.register(import("./routes/biotopes/aquariums"), {
            prefix: "/aquariums",
        });

        await fastify.register(import("./routes/biotopes/terrariums"), {
            prefix: "/terrariums",
        });

        instance.register(
            async (instance) => {
                instance.addHook(
                    "preHandler",
                    instance.auth([isAdminLoggedIn]),
                );

                instance.addHook("onRoute", (routeOptions) => {
                    injectSchemaInRouteOption(
                        routeOptions,
                        403,
                        UserNotAdminApiError.schema,
                    );
                });

                await fastify.register(import("./routes/admin/users"), {
                    prefix: "/users",
                });

                await fastify.register(
                    import("./routes/admin/measurementTypes"),
                    {
                        prefix: "/measurementTypes",
                    },
                );
            },
            { prefix: "/admin" },
        );
    });
});

// - - - - - Setup cron jobs - - - - - //
// Every day at 00:00
cron.schedule("0 0 * * *", () => {
    EmailValidationOTPModel.destroyExpiredTokens();
    UserModel.destroyExpiredDeletedUsers();
});
