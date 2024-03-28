import { FastifyPluginAsync } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { TerrariumCreateDtoSchema } from "../../dto/terrarium/TerrariumCreateDto";
import { TerrariumDtoSchema } from "../../dto/terrarium/TerrariumDto";
import { TerrariumUpdateDtoSchema } from "../../dto/terrarium/TerrariumUpdateDto";
import { TerrariumNotFoundApiError } from "../../errors/ApiError/TerrariumNotFoundApiError";
import { UserNotOwnerOfTerrariumApiError } from "../../errors/ApiError/UserNotOwnerOTerrariumApiError";
import { BiotopeModel } from "../../model/BiotopeModel";
import { TerrariumModel } from "../../model/TerrariumModel";
import {
    injectParamSchemaInRouteOption,
    injectResponseSchemaInRouteOption,
    injectTagSchemaInRouteOption,
} from "../../utils/routeOptionInjection";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    instance.addHook("onRoute", (routeOptions) => {
        injectTagSchemaInRouteOption(routeOptions, "terrariums");
    });

    instance.get(
        "/",
        {
            schema: {
                description:
                    "Get all terrariums not archived of the connected user",
                response: {
                    200: TerrariumDtoSchema.array(),
                },
            },
        },
        async function (req, res) {
            const biotopes = await req.user!.getBiotopeModels({
                where: {
                    archivedDate: null,
                },
                include: {
                    model: TerrariumModel,
                    required: true,
                },
            });

            res.send(
                biotopes.map((biotope) =>
                    TerrariumDtoSchema.parse({
                        ...biotope.dataValues,
                        ...biotope.TerrariumModel!.dataValues,
                    }),
                ),
            );
        },
    );

    instance.post(
        "/",
        {
            schema: {
                description: "Create an terrarium",
                body: TerrariumCreateDtoSchema,
                response: {
                    200: TerrariumDtoSchema,
                },
            },
        },
        async function (req, res) {
            const biotope = await req.user!.createBiotopeModel({
                type: "TERRARIUM",
                ...req.body,
            });

            const terrarium = await biotope.createTerrariumModel({
                ...req.body,
            });

            res.send(
                TerrariumDtoSchema.parse({
                    ...biotope.dataValues,
                    ...terrarium.dataValues,
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
                        model: TerrariumModel,
                        required: true,
                    },
                });

                if (!biotope) throw new TerrariumNotFoundApiError();
                if (biotope.userId !== req.user!.id) {
                    throw new UserNotOwnerOfTerrariumApiError();
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
                    UserNotOwnerOfTerrariumApiError.schema,
                );

                injectResponseSchemaInRouteOption(
                    routeOptions,
                    404,
                    TerrariumNotFoundApiError.schema,
                );
            });

            instance.get(
                "/",
                {
                    schema: {
                        description: "Get an terrarium",
                        response: {
                            200: TerrariumDtoSchema,
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    res.send(
                        TerrariumDtoSchema.parse({
                            ...biotope.dataValues,
                            ...biotope.TerrariumModel!.dataValues,
                        }),
                    );
                },
            );

            instance.patch(
                "/",
                {
                    schema: {
                        description: "Update an terrarium",
                        body: TerrariumUpdateDtoSchema,
                        response: {
                            200: TerrariumDtoSchema,
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    await biotope.update(req.body);
                    await biotope.TerrariumModel!.update(req.body);

                    res.send(
                        TerrariumDtoSchema.parse({
                            ...biotope.dataValues,
                            ...biotope.TerrariumModel!.dataValues,
                        }),
                    );
                },
            );

            instance.put(
                "/archive",
                {
                    schema: {
                        description: "Archive an terrarium",
                        response: {
                            200: TerrariumDtoSchema,
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    biotope.archivedDate = new Date();
                    await biotope.save();

                    res.send(
                        TerrariumDtoSchema.parse({
                            ...biotope.dataValues,
                            ...biotope.TerrariumModel!.dataValues,
                        }),
                    );
                },
            );

            instance.put(
                "/unarchive",
                {
                    schema: {
                        description: "Unarchive an terrarium",
                        response: {
                            200: TerrariumDtoSchema,
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    biotope.archivedDate = null;
                    await biotope.save();

                    res.send(
                        TerrariumDtoSchema.parse({
                            ...biotope.dataValues,
                            ...biotope.TerrariumModel!.dataValues,
                        }),
                    );
                },
            );

            await fastify.register(import("./generics"));
        },
        {
            prefix: "/:id",
        },
    );
}) satisfies FastifyPluginAsync;
