import { FastifyPluginAsync } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Op } from "sequelize";
import { z } from "zod";
import { AquariumCreateDtoSchema } from "../dto/aquarium/AquariumCreateDto";
import { AquariumDtoSchema } from "../dto/aquarium/AquariumDto";
import { AquariumUpdateDtoSchema } from "../dto/aquarium/AquariumUpdateDto";
import { MeasurementCreateDtoSchema } from "../dto/measurement/MeasurementCreateDto";
import { MeasurementDtoSchema } from "../dto/measurement/MeasurementDto";
import { MeasurementSettingDtoSchema } from "../dto/measurementSetting/MeasurementSettingDto";
import AquariumModel from "../model/AquariumModel";
import MeasurementModel from "../model/MeasurementModel";
import MeasurementTypeModel from "../model/MeasurementTypeModel";

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
            const aquariums = await req.user!.getAquariumModels({
                where: {
                    archivedDate: null,
                },
            });

            res.send(
                aquariums.map((aquarium) => AquariumDtoSchema.parse(aquarium)),
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
            const aquarium = await AquariumModel.create({
                ...req.body,
                userId: req.user!.id,
            });

            res.send(AquariumDtoSchema.parse(aquarium));
        },
    );

    instance.get(
        "/:id",
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
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            res.send(AquariumDtoSchema.parse(aquarium));
        },
    );

    instance.get(
        "/:id/image",
        {
            schema: {
                tags: ["aquariums"],
                description: "Get an aquarium image",
                params: z.object({
                    id: z.string().uuid(),
                }),
                response: {
                    200: z.custom<Blob>().optional(),
                },
            },
        },
        async function (req, res) {
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            res.send(aquarium.image);
        },
    );

    instance.patch(
        "/:id",
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
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            await aquarium.update(req.body);

            res.send(AquariumDtoSchema.parse(aquarium));
        },
    );

    instance.delete(
        "/:id",
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
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            await aquarium.destroy();

            res.status(204).send();
        },
    );

    instance.put(
        "/:id/archive",
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
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            aquarium.archivedDate = new Date();
            await aquarium.save();

            res.send(AquariumDtoSchema.parse(aquarium));
        },
    );

    instance.put(
        "/:id/unarchive",
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
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            aquarium.archivedDate = null;
            await aquarium.save();

            res.send(AquariumDtoSchema.parse(aquarium));
        },
    );

    // Measurements
    instance.get(
        "/:id/measurements/:type",
        {
            schema: {
                tags: ["aquariums"],
                description: "Get aquarium's measurements of a type",
                params: z.object({
                    id: z.string().uuid(),
                    type: z.string(),
                }),
                querystring: z.object({
                    from: z.coerce.date().default(() => new Date(0)),
                    to: z.coerce.date().default(() => new Date()),
                }),
                response: {
                    200: MeasurementDtoSchema.array(),
                },
            },
        },
        async function (req, res) {
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            const type = MeasurementTypeModel.getByCode(req.params.type);
            if (!type) return res.status(404).send();

            const measurements = await aquarium.getMeasurementModels({
                where: {
                    type: type.code,
                    measuredAt: {
                        [Op.between]: [req.query.from, req.query.to],
                    },
                },
                order: [["measuredAt", "ASC"]],
            });

            console.log(req.query.from, req.query.to);

            res.send(
                measurements.map((measurement) =>
                    MeasurementDtoSchema.parse(measurement),
                ),
            );
        },
    );

    instance.post(
        "/:id/measurements/:type",
        {
            schema: {
                tags: ["aquariums"],
                description: "Add an aquarium's measurement of a type",
                params: z.object({
                    id: z.string().uuid(),
                    type: z.string(),
                }),
                body: MeasurementCreateDtoSchema,
                response: {
                    200: MeasurementDtoSchema,
                },
            },
        },
        async function (req, res) {
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            const type = MeasurementTypeModel.getByCode(req.params.type);
            if (!type) return res.status(404).send();

            const measurement = await aquarium.createMeasurementModel({
                type: type.code,
                value: req.body.value,
                measuredAt: req.body.measuredAt,
            });

            res.send(MeasurementDtoSchema.parse(measurement));
        },
    );

    instance.get(
        "/:id/measurements/:type/last",
        {
            schema: {
                tags: ["aquariums"],
                description: "Get last aquarium's measurement of a type",
                params: z.object({
                    id: z.string().uuid(),
                    type: z.string(),
                }),
                response: {
                    200: MeasurementDtoSchema,
                },
            },
        },
        async function (req, res) {
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            const type = MeasurementTypeModel.getByCode(req.params.type);
            if (!type) return res.status(404).send();

            const measurement = await MeasurementModel.findOne({
                where: {
                    aquariumId: aquarium.id,
                    type: type.code,
                },
                order: [["measuredAt", "DESC"]],
            });

            res.send(
                measurement
                    ? MeasurementDtoSchema.parse(measurement)
                    : undefined,
            );
        },
    );

    /**
     * @deprecated use /:id/measurements/TEMPERATURE instead
     * Concerve for aquatracker v1 compatibility
     */
    instance.post(
        "/:id/temperature",
        {
            schema: {
                tags: ["aquariums"],
                description: "Add temperature measurement of aquarium",
                deprecated: true,
                params: z.object({
                    id: z.string().uuid(),
                }),
                body: z.object({
                    temperature: z.number(),
                }),
                response: {
                    200: z.null(),
                },
            },
        },
        async function (req, res) {
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            await aquarium.createMeasurementModel({
                type: "TEMPERATURE",
                value: req.body.temperature,
                measuredAt: new Date(),
            });

            res.send();
        },
    );

    instance.get(
        "/:id/measurements/settings",
        {
            schema: {
                tags: ["aquariums"],
                description: "Get aquarium's measurements settings",
                params: z.object({
                    id: z.string().uuid(),
                }),
                response: {
                    200: MeasurementSettingDtoSchema.array(),
                },
            },
        },
        async function (req, res) {
            const aquarium = await AquariumModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!aquarium) return res.status(404).send();
            if (aquarium.userId !== req.user!.id) return res.status(403).send();

            let settings = await aquarium.getMeasurementSettingModels();

            // Check if all types are present and create them if not (Absolutly need to drop this with a refactor of measurement settings, sorry for this ugly code)
            if (
                settings
                    .map((setting) => setting.type)
                    .sort()
                    .toString() !==
                MeasurementTypeModel.getAll()
                    .map((type) => type.code)
                    .sort()
                    .toString()
            ) {
                let order = 0;
                if (settings.length > 0) {
                    order =
                        Math.max(...settings.map((setting) => setting.order)) +
                        1;
                }
                for (let type of MeasurementTypeModel.getAll()) {
                    if (
                        !settings.find((setting) => setting.type === type.code)
                    ) {
                        await aquarium.createMeasurementSettingModel({
                            type: type.code,
                            order: order,
                        });
                        order++;
                    }
                }
                settings = await aquarium.getMeasurementSettingModels();
            }

            res.send(
                settings.map((setting) =>
                    MeasurementSettingDtoSchema.parse(setting),
                ),
            );
        },
    );

    // TODO : Reimplement edit of measurement settings
}) satisfies FastifyPluginAsync;
