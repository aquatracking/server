import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { MeasurementSubscriptionCreateDtoSchema } from "../../../../dto/measurementSubscription/MeasurementSubscriptionCreateDto";
import { MeasurementSubscriptionDtoSchema } from "../../../../dto/measurementSubscription/MeasurementSubscriptionDto";
import { MeasurementSubscriptionUpdateDtoSchema } from "../../../../dto/measurementSubscription/MeasurementSubscriptionUpdateDto";
import { MeasurementSubscriptionWithTypeDtoSchema } from "../../../../dto/measurementSubscription/MeasurementSubscriptionWithTypeDto";
import { MeasurementSubscriptionAlreadyExistApiError } from "../../../../errors/ApiError/MeasurementSubscriptionAlreadyExistApiError";
import { MeasurementSubscriptionNotFoundApiError } from "../../../../errors/ApiError/MeasurementSubscriptionNotFoundApiError";
import { MeasurementTypeNotFoundApiError } from "../../../../errors/ApiError/MeasurementTypeNotFoundApiError";
import { MeasurementSubscriptionModel } from "../../../../model/MeasurementSubscriptionModel";
import { MeasurementTypeModel } from "../../../../model/MeasurementTypeModel";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    const schemaBiotopeType = /\/(\w+)s\/:id\/measurements\/subscriptions/.exec(
        instance.prefix,
    )?.[1];
    if (!schemaBiotopeType) return;

    instance.get(
        "/",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Get ${schemaBiotopeType}'s measurement subscriptions. Order by order ascending.`,
                response: {
                    200: MeasurementSubscriptionWithTypeDtoSchema.array(),
                },
            },
        },
        async function (req, res) {
            const biotope = req.biotope!;

            const measurementSubscriptions =
                await biotope.getMeasurementSubscriptionModels({
                    include: ["MeasurementTypeModel"],
                    order: [["order", "ASC"]],
                });

            res.send(
                measurementSubscriptions.map((measurement) =>
                    MeasurementSubscriptionWithTypeDtoSchema.parse({
                        ...measurement.dataValues,
                        measurementType:
                            measurement.MeasurementTypeModel!.dataValues,
                    }),
                ),
            );
        },
    );

    instance.post(
        "/:code",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Add a measurement subscription to ${schemaBiotopeType}.`,
                params: z.object({
                    code: z.string(),
                }),
                body: MeasurementSubscriptionCreateDtoSchema,
                response: {
                    201: MeasurementSubscriptionDtoSchema,
                    404: MeasurementTypeNotFoundApiError.schema,
                    409: MeasurementSubscriptionAlreadyExistApiError.schema,
                },
            },
        },
        async function (req, res) {
            const biotope = req.biotope!;

            const measurementType = await MeasurementTypeModel.findOne({
                where: { code: req.params.code },
            });

            if (!measurementType) {
                throw new MeasurementTypeNotFoundApiError();
            }

            let order = req.body.order;

            if (!order) {
                const ms = await biotope.getMeasurementSubscriptionModels({
                    order: [["order", "DESC"]],
                    limit: 1,
                });
                order = ms.length > 0 ? ms[0].order + 1 : 0;
            }

            const measurementSubscription = await biotope
                .createMeasurementSubscriptionModel({
                    ...req.body,
                    order: order,
                    measurementTypeCode: measurementType.code,
                })
                .catch((err) => {
                    if (err.name === "SequelizeUniqueConstraintError") {
                        throw new MeasurementSubscriptionAlreadyExistApiError();
                    }
                    throw err;
                });

            res.status(201).send(
                MeasurementSubscriptionDtoSchema.parse(measurementSubscription),
            );
        },
    );

    instance.delete(
        "/:code",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Delete a measurement subscription from ${schemaBiotopeType}.`,
                params: z.object({
                    code: z.string(),
                }),
                response: {
                    204: z.void(),
                    404: z.union([
                        MeasurementSubscriptionNotFoundApiError.schema,
                        MeasurementTypeNotFoundApiError.schema,
                    ]),
                },
            },
        },
        async function (req, res) {
            const biotope = req.biotope!;

            const measurementType = await MeasurementTypeModel.findOne({
                where: { code: req.params.code },
            });

            if (!measurementType) {
                throw new MeasurementTypeNotFoundApiError();
            }

            const measurementSubscription =
                await MeasurementSubscriptionModel.findOne({
                    where: {
                        biotopeId: biotope.id,
                        measurementTypeCode: measurementType.code,
                    },
                });

            if (!measurementSubscription) {
                throw new MeasurementSubscriptionNotFoundApiError();
            }

            await measurementSubscription.destroy();

            res.status(204).send();
        },
    );

    instance.patch(
        "/:code",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Update a measurement subscription from ${schemaBiotopeType}.`,
                params: z.object({
                    code: z.string(),
                }),
                body: MeasurementSubscriptionUpdateDtoSchema,
                response: {
                    200: MeasurementSubscriptionDtoSchema,
                    404: z.union([
                        MeasurementSubscriptionNotFoundApiError.schema,
                        MeasurementTypeNotFoundApiError.schema,
                    ]),
                },
            },
        },
        async function (req, res) {
            const biotope = req.biotope!;

            const measurementType = await MeasurementTypeModel.findOne({
                where: { code: req.params.code },
            });

            if (!measurementType) {
                throw new MeasurementTypeNotFoundApiError();
            }

            const measurementSubscription =
                await MeasurementSubscriptionModel.findOne({
                    where: {
                        biotopeId: biotope.id,
                        measurementTypeCode: measurementType.code,
                    },
                });

            if (!measurementSubscription) {
                throw new MeasurementSubscriptionNotFoundApiError();
            }

            await measurementSubscription.update(req.body);

            res.send(
                MeasurementSubscriptionDtoSchema.parse(measurementSubscription),
            );
        },
    );
}) satisfies FastifyPluginAsync;
