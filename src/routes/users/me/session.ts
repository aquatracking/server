import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { UserSessionDtoSchema } from "../../../dto/userSession/userSessionDto";
import { NotSessionLoggedUserApiError } from "../../../errors/ApiError/NotSessionLoggedUserApiError";
import { UserSessionNotFoundApiError } from "../../../errors/ApiError/UserSessionNotFoundApiError";
import { UserSessionModel } from "../../../model/UserSessionModel";
import { injectTagSchemaInRouteOption } from "../../../utils/routeOptionInjection";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    instance.addHook("onRoute", (routeOptions) => {
        injectTagSchemaInRouteOption(routeOptions, "sessions");
    });

    instance.get(
        "/",
        {
            schema: {
                description: "Get the current user's sessions.",
                response: {
                    200: UserSessionDtoSchema.array(),
                },
            },
        },
        async function (req) {
            const sessions = await req.user!.getUserSessionModels();

            const parsedSessions = sessions.map((session) => {
                const parsed = UserSessionDtoSchema.parse(session);
                parsed.current = session.id === req.session?.id;

                return parsed;
            });

            return parsedSessions;
        },
    );

    instance.get(
        "/:id",
        {
            schema: {
                description: "Get a session.",
                params: z.object({
                    id: z.string().uuid(),
                }),
                response: {
                    200: UserSessionDtoSchema,
                    404: UserSessionNotFoundApiError.schema,
                },
            },
        },
        async function (req) {
            const session = await UserSessionModel.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user!.id,
                },
            });

            if (!session) {
                throw new UserSessionNotFoundApiError();
            }

            const parsed = UserSessionDtoSchema.parse(session);
            parsed.current = session.id === req.session?.id;

            return parsed;
        },
    );

    instance.get(
        "/current",
        {
            schema: {
                description: "Get the current user's session.",
                response: {
                    200: UserSessionDtoSchema,
                    403: NotSessionLoggedUserApiError.schema,
                },
            },
        },
        async function (req) {
            if (!req.session) {
                throw new NotSessionLoggedUserApiError();
            }

            const parsed = UserSessionDtoSchema.parse(req.session);
            parsed.current = true;

            return parsed;
        },
    );

    instance.delete(
        "/",
        {
            schema: {
                description: "Delete all the current user's sessions.",
                response: {
                    204: z.void(),
                },
            },
        },
        async function (req, res) {
            await req.user!.destroyAllSessions();

            res.status(204).send();
        },
    );

    instance.delete(
        "/:id",
        {
            schema: {
                description: "Delete a session.",
                params: z.object({
                    id: z.string().uuid(),
                }),
                response: {
                    204: z.void(),
                    404: UserSessionNotFoundApiError.schema,
                },
            },
        },
        async function (req, res) {
            const session = await UserSessionModel.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user!.id,
                },
            });

            if (!session) {
                throw new UserSessionNotFoundApiError();
            }

            await session.destroy();

            res.status(204).send();
        },
    );
}) satisfies FastifyPluginAsync;
