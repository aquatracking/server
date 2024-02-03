import { FastifyInstance, FastifyPluginAsync } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Op } from "sequelize";
import { z } from "zod";
import { AquariumCreateDtoSchema } from "../dto/aquarium/AquariumCreateDto";
import { AquariumDtoSchema } from "../dto/aquarium/AquariumDto";
import { AquariumUpdateDtoSchema } from "../dto/aquarium/AquariumUpdateDto";
import { MeasurementCreateDtoSchema } from "../dto/measurement/MeasurementCreateDto";
import { MeasurementDtoSchema } from "../dto/measurement/MeasurementDto";
import { MeasurementSettingDtoSchema } from "../dto/measurementSetting/MeasurementSettingDto";
import { AquariumModel } from "../model/AquariumModel";
import { MeasurementModel } from "../model/MeasurementModel";
import { MeasurementTypeModel } from "../model/MeasurementTypeModel";
import { BiotopeModel } from "../model/BiotopeModel";

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

                if (!biotope) return res.status(404).send();
                if (biotope.userId !== req.user!.id) {
                    return res.status(403).send();
                }

                req.biotope = biotope;
            });

            instance.get(
                "/",
                {
                    schema: {
                        tags: ["aquariums"],
                        description: "Get an aquarium",
                        params: z.object({
                            id: z.string().uuid(),
                        }),
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

            instance.get(
                "/image",
                {
                    schema: {
                        tags: ["aquariums"],
                        description: "Get an aquarium image",
                        params: z.object({
                            id: z.string().uuid(),
                        }),
                        response: {
                            200: z.custom<Blob>().nullable(),
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    res.send(biotope.image);
                },
            );

            instance.patch(
                "/",
                {
                    schema: {
                        tags: ["aquariums"],
                        description: "Update an aquarium",
                        params: z.object({
                            id: z.string().uuid(),
                        }),
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

            instance.delete(
                "/",
                {
                    schema: {
                        tags: ["aquariums"],
                        description: "Delete an aquarium",
                        params: z.object({
                            id: z.string().uuid(),
                        }),
                        response: {
                            204: z.null(),
                        },
                    },
                },
                async function (req, res) {
                    const biotope = req.biotope!;

                    await biotope.destroy();

                    res.status(204).send();
                },
            );

            instance.put(
                "/archive",
                {
                    schema: {
                        tags: ["aquariums"],
                        description: "Archive an aquarium",
                        params: z.object({
                            id: z.string().uuid(),
                        }),
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
                        params: z.object({
                            id: z.string().uuid(),
                        }),
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
        },
        {
            prefix: "/:id",
        },
    );

    // Measurements
    // instance.get(
    //     "/:id/measurements/:type",
    //     {
    //         schema: {
    //             tags: ["aquariums"],
    //             description: "Get aquarium's measurements of a type",
    //             params: z.object({
    //                 id: z.string().uuid(),
    //                 type: z.string(),
    //             }),
    //             querystring: z.object({
    //                 from: z.coerce.date().default(() => new Date(0)),
    //                 to: z.coerce.date().default(() => new Date()),
    //             }),
    //             response: {
    //                 200: MeasurementDtoSchema.array(),
    //             },
    //         },
    //     },
    //     async function (req, res) {
    //         const aquarium = await AquariumModel.findOne({
    //             where: {
    //                 id: req.params.id,
    //             },
    //         });

    //         if (!aquarium) return res.status(404).send();
    //         if (aquarium.userId !== req.user!.id) return res.status(403).send();

    //         const type = MeasurementTypeModel.getByCode(req.params.type);
    //         if (!type) return res.status(404).send();

    //         const measurements = await aquarium.getMeasurementModels({
    //             where: {
    //                 type: type.code,
    //                 measuredAt: {
    //                     [Op.between]: [req.query.from, req.query.to],
    //                 },
    //             },
    //             order: [["measuredAt", "ASC"]],
    //         });

    //         console.log(req.query.from, req.query.to);

    //         res.send(
    //             measurements.map((measurement) =>
    //                 MeasurementDtoSchema.parse(measurement),
    //             ),
    //         );
    //     },
    // );

    // instance.post(
    //     "/:id/measurements/:type",
    //     {
    //         schema: {
    //             tags: ["aquariums"],
    //             description: "Add an aquarium's measurement of a type",
    //             params: z.object({
    //                 id: z.string().uuid(),
    //                 type: z.string(),
    //             }),
    //             body: MeasurementCreateDtoSchema,
    //             response: {
    //                 200: MeasurementDtoSchema,
    //             },
    //         },
    //     },
    //     async function (req, res) {
    //         const aquarium = await AquariumModel.findOne({
    //             where: {
    //                 id: req.params.id,
    //             },
    //         });

    //         if (!aquarium) return res.status(404).send();
    //         if (aquarium.userId !== req.user!.id) return res.status(403).send();

    //         const type = MeasurementTypeModel.getByCode(req.params.type);
    //         if (!type) return res.status(404).send();

    //         const measurement = await aquarium.createMeasurementModel({
    //             type: type.code,
    //             value: req.body.value,
    //             measuredAt: req.body.measuredAt,
    //         });

    //         res.send(MeasurementDtoSchema.parse(measurement));
    //     },
    // );

    // instance.get(
    //     "/:id/measurements/:type/last",
    //     {
    //         schema: {
    //             tags: ["aquariums"],
    //             description: "Get last aquarium's measurement of a type",
    //             params: z.object({
    //                 id: z.string().uuid(),
    //                 type: z.string(),
    //             }),
    //             response: {
    //                 200: MeasurementDtoSchema,
    //             },
    //         },
    //     },
    //     async function (req, res) {
    //         const aquarium = await AquariumModel.findOne({
    //             where: {
    //                 id: req.params.id,
    //             },
    //         });

    //         if (!aquarium) return res.status(404).send();
    //         if (aquarium.userId !== req.user!.id) return res.status(403).send();

    //         const type = MeasurementTypeModel.getByCode(req.params.type);
    //         if (!type) return res.status(404).send();

    //         const measurement = await MeasurementModel.findOne({
    //             where: {
    //                 aquariumId: aquarium.id,
    //                 type: type.code,
    //             },
    //             order: [["measuredAt", "DESC"]],
    //         });

    //         res.send(
    //             measurement
    //                 ? MeasurementDtoSchema.parse(measurement)
    //                 : undefined,
    //         );
    //     },
    // );

    // /**
    //  * @deprecated use /:id/measurements/TEMPERATURE instead
    //  * Concerve for aquatracker v1 compatibility
    //  */
    // instance.post(
    //     "/:id/temperature",
    //     {
    //         schema: {
    //             tags: ["aquariums"],
    //             description: "Add temperature measurement of aquarium",
    //             deprecated: true,
    //             params: z.object({
    //                 id: z.string().uuid(),
    //             }),
    //             body: z.object({
    //                 temperature: z.number(),
    //             }),
    //             response: {
    //                 200: z.null(),
    //             },
    //         },
    //     },
    //     async function (req, res) {
    //         const aquarium = await AquariumModel.findOne({
    //             where: {
    //                 id: req.params.id,
    //             },
    //         });

    //         if (!aquarium) return res.status(404).send();
    //         if (aquarium.userId !== req.user!.id) return res.status(403).send();

    //         await aquarium.createMeasurementModel({
    //             type: "TEMPERATURE",
    //             value: req.body.temperature,
    //             measuredAt: new Date(),
    //         });

    //         res.send();
    //     },
    // );

    // instance.get(
    //     "/:id/measurements/settings",
    //     {
    //         schema: {
    //             tags: ["aquariums"],
    //             description: "Get aquarium's measurements settings",
    //             params: z.object({
    //                 id: z.string().uuid(),
    //             }),
    //             response: {
    //                 200: MeasurementSettingDtoSchema.array(),
    //             },
    //         },
    //     },
    //     async function (req, res) {
    //         const aquarium = await AquariumModel.findOne({
    //             where: {
    //                 id: req.params.id,
    //             },
    //         });

    //         if (!aquarium) return res.status(404).send();
    //         if (aquarium.userId !== req.user!.id) return res.status(403).send();

    //         let settings = await aquarium.getMeasurementSettingModels();

    //         // Check if all types are present and create them if not (Absolutly need to drop this with a refactor of measurement settings, sorry for this ugly code)
    //         if (
    //             settings
    //                 .map((setting) => setting.type)
    //                 .sort()
    //                 .toString() !==
    //             MeasurementTypeModel.getAll()
    //                 .map((type) => type.code)
    //                 .sort()
    //                 .toString()
    //         ) {
    //             let order = 0;
    //             if (settings.length > 0) {
    //                 order =
    //                     Math.max(...settings.map((setting) => setting.order)) +
    //                     1;
    //             }
    //             for (let type of MeasurementTypeModel.getAll()) {
    //                 if (
    //                     !settings.find((setting) => setting.type === type.code)
    //                 ) {
    //                     await aquarium.createMeasurementSettingModel({
    //                         type: type.code,
    //                         order: order,
    //                     });
    //                     order++;
    //                 }
    //             }
    //             settings = await aquarium.getMeasurementSettingModels();
    //         }

    //         res.send(
    //             settings.map((setting) =>
    //                 MeasurementSettingDtoSchema.parse(setting),
    //             ),
    //         );
    //     },
    // );

    // TODO : Reimplement edit of measurement settings
}) satisfies FastifyPluginAsync;
