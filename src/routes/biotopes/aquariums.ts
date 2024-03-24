import { FastifyPluginAsync } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AquariumCreateDtoSchema } from "../../dto/aquarium/AquariumCreateDto";
import { AquariumDtoSchema } from "../../dto/aquarium/AquariumDto";
import { AquariumUpdateDtoSchema } from "../../dto/aquarium/AquariumUpdateDto";
import { AquariumModel } from "../../model/AquariumModel";
import { BiotopeModel } from "../../model/BiotopeModel";
import {
    injectParamSchemaInRouteOption,
    injectResponseSchemaInRouteOption,
} from "../../utils/routeOptionInjection";
import { UserNotOwnerOfAquariumApiError } from "../../errors/ApiError/UserNotOwnerOfAquariumApiError";
import { AquariumNotFoundApiError } from "../../errors/ApiError/AquariumNotFoundApiError";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    instance.get(
        "/",
        {
            schema: {
                tags: ["aquariums"],
                description:
                    "Get all aquariums not archived of the connected user",
                response: {
                    200: AquariumDtoSchema.array(),
                },
            },
        },
        async function (req, res) {
            const biotopes = await req.user!.getBiotopeModels({
                where: {
                    archivedDate: null,
                },
                include: {
                    model: AquariumModel,
                    required: true,
                },
            });

            res.send(
                biotopes.map((biotope) =>
                    AquariumDtoSchema.parse({
                        ...biotope.dataValues,
                        ...biotope.AquariumModel!.dataValues,
                    }),
                ),
            );
        },
    );

    instance.post(
        "/",
        {
            schema: {
                tags: ["aquariums"],
                description: "Create an aquarium",
                body: AquariumCreateDtoSchema,
                response: {
                    200: AquariumDtoSchema,
                },
            },
        },
        async function (req, res) {
            const biotope = await req.user!.createBiotopeModel({
                type: "AQUARIUM",
                ...req.body,
            });

            const aquarium = await biotope.createAquariumModel({
                ...req.body,
            });

            res.send(
                AquariumDtoSchema.parse({
                    ...biotope.dataValues,
                    ...aquarium.dataValues,
                }),
            );
        },
    );

    instance.register(
        async (fastify) => {
            const instance = fastify.withTypeProvider<ZodTypeProvider>();

            instance.addHook("preHandler", async (req, res) => {
                const params = z
                    .object({
                        id: z.string().uuid(),
                    })
                    .parse(req.params);

                const biotope = await BiotopeModel.findOne({
                    where: {
                        id: params.id,
                    },
                    include: {
                        model: AquariumModel,
                        required: true,
                    },
                });

                if (!biotope) throw new AquariumNotFoundApiError();
                if (biotope.userId !== req.user!.id) {
                    throw new UserNotOwnerOfAquariumApiError();
                }

                req.biotope = biotope;
            });

            instance.addHook("onRoute", (routeOptions) => {
                injectParamSchemaInRouteOption(
                    routeOptions,
                    z.object({
                        id: z.string().uuid(),
                    }),
                );

                injectResponseSchemaInRouteOption(
                    routeOptions,
                    403,
                    UserNotOwnerOfAquariumApiError.schema,
                );

                injectResponseSchemaInRouteOption(
                    routeOptions,
                    404,
                    AquariumNotFoundApiError.schema,
                );
            });

            instance.get(
                "/",
                {
                    schema: {
                        tags: ["aquariums"],
                        description: "Get an aquarium",
                        response: {
                            200: AquariumDtoSchema,
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    res.send(
                        AquariumDtoSchema.parse({
                            ...biotope.dataValues,
                            ...biotope.AquariumModel!.dataValues,
                        }),
                    );
                },
            );

            instance.patch(
                "/",
                {
                    schema: {
                        tags: ["aquariums"],
                        description: "Update an aquarium",
                        body: AquariumUpdateDtoSchema,
                        response: {
                            200: AquariumDtoSchema,
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    await biotope.update(req.body);
                    await biotope.AquariumModel!.update(req.body);

                    res.send(
                        AquariumDtoSchema.parse({
                            ...biotope.dataValues,
                            ...biotope.AquariumModel!.dataValues,
                        }),
                    );
                },
            );

            instance.put(
                "/archive",
                {
                    schema: {
                        tags: ["aquariums"],
                        description: "Archive an aquarium",
                        response: {
                            200: AquariumDtoSchema,
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    biotope.archivedDate = new Date();
                    await biotope.save();

                    res.send(
                        AquariumDtoSchema.parse({
                            ...biotope.dataValues,
                            ...biotope.AquariumModel!.dataValues,
                        }),
                    );
                },
            );

            instance.put(
                "/unarchive",
                {
                    schema: {
                        tags: ["aquariums"],
                        description: "Unarchive an aquarium",
                        response: {
                            200: AquariumDtoSchema,
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    biotope.archivedDate = null;
                    await biotope.save();

                    res.send(
                        AquariumDtoSchema.parse({
                            ...biotope.dataValues,
                            ...biotope.AquariumModel!.dataValues,
                        }),
                    );
                },
            );

            /**
             * @deprecated use /:id/measurements/TEMPERATURE instead
             * Concerve for aquatracker v1 compatibility
             */
            instance.post(
                "/temperature",
                {
                    schema: {
                        tags: ["aquariums"],
                        description: "Add temperature measurement of aquarium",
                        deprecated: true,
                        body: z.object({
                            temperature: z.number(),
                        }),
                        response: {
                            200: z.null(),
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    await biotope.createMeasurementModel({
                        measurementTypeCode: "TEMPERATURE",
                        value: req.body.temperature,
                    });

                    res.send();
                },
            );

            await fastify.register(import("./generics"));
        },
        {
            prefix: "/:id",
        },
    );
}) satisfies FastifyPluginAsync;
