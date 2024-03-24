import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Op } from "sequelize";
import { z } from "zod";
import { MeasurementCreateDtoSchema } from "../../../dto/measurement/MeasurementCreateDto";
import { MeasurementDtoSchema } from "../../../dto/measurement/MeasurementDto";
import { MeasurementModel } from "../../../model/MeasurementModel";
import { MeasurementNotFoundApiError } from "../../../errors/ApiError/MeasurementNotFoundApiError";

const measurementsQueryStringSchema = z.object({
    measurementTypeCode: z
        .union([z.string().array(), z.string()])
        .default([])
        .transform((v) => {
            if (Array.isArray(v)) return v;
            return [v];
        }),
    from: z.coerce.date().default(() => new Date(0)),
    to: z.coerce.date().default(() => new Date()),
});

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    const schemaBiotopeType = /\/(\w+)s\/:id\/measurements/.exec(
        instance.prefix,
    )?.[1];
    if (!schemaBiotopeType) return;

    instance.get(
        "/",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Get ${schemaBiotopeType}'s measurements. Order by most recent measuredAt to least recent measuredAt`,
                querystring: measurementsQueryStringSchema,
                response: {
                    200: MeasurementDtoSchema.array(),
                },
            },
        },
        async function (req, res) {
            const biotope = req.biotope!;

            const measurements = await biotope.getMeasurementModels({
                where: [
                    {
                        measuredAt: {
                            [Op.between]: [req.query.from, req.query.to],
                        },
                    },
                    req.query.measurementTypeCode.length > 0
                        ? {
                              measurementTypeCode: {
                                  [Op.in]: req.query.measurementTypeCode,
                              },
                          }
                        : {},
                ],
                order: [["measuredAt", "DESC"]],
            });

            res.send(
                measurements.map((measurement) =>
                    MeasurementDtoSchema.parse(measurement),
                ),
            );
        },
    );

    instance.get(
        "/last",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Get last ${schemaBiotopeType}'s measurement.`,
                querystring: measurementsQueryStringSchema,
                response: {
                    200: MeasurementDtoSchema.optional(),
                },
            },
        },
        async function (req, res) {
            const biotope = req.biotope!;

            const measurements = await MeasurementModel.findOne({
                where: [
                    {
                        biotopeId: biotope.id,
                        measuredAt: {
                            [Op.between]: [req.query.from, req.query.to],
                        },
                    },
                    req.query.measurementTypeCode.length > 0
                        ? {
                              measurementTypeCode: {
                                  [Op.in]: req.query.measurementTypeCode,
                              },
                          }
                        : {},
                ],
                order: [["measuredAt", "DESC"]],
            });

            res.send(
                measurements
                    ? MeasurementDtoSchema.parse(measurements)
                    : undefined,
            );
        },
    );

    instance.get(
        "/:measurementId",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Get measurement by id`,
                params: z.object({
                    measurementId: z.string().uuid(),
                }),
                response: {
                    200: MeasurementDtoSchema,
                    404: MeasurementNotFoundApiError.schema,
                },
            },
        },
        async function (req, res) {
            const biotope = req.biotope!;

            const measurement = await MeasurementModel.findOne({
                where: {
                    id: req.params.measurementId,
                    biotopeId: biotope.id,
                },
            });
            if (!measurement) throw new MeasurementNotFoundApiError();

            res.send(MeasurementDtoSchema.parse(measurement));
        },
    );

    instance.post(
        "/",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Add ${schemaBiotopeType}'s measurement`,
                body: MeasurementCreateDtoSchema,
                response: {
                    200: MeasurementDtoSchema,
                },
            },
        },
        async function (req, res) {
            const biotope = req.biotope!;

            const measurement = await biotope.createMeasurementModel(req.body);

            res.send(MeasurementDtoSchema.parse(measurement));
        },
    );

    instance.delete(
        "/:measurementId",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Delete measurement by id`,
                params: z.object({
                    measurementId: z.string().uuid(),
                }),
                response: {
                    204: z.null(),
                    404: MeasurementNotFoundApiError.schema,
                },
            },
        },
        async function (req, res) {
            const biotope = req.biotope!;

            const measurement = await MeasurementModel.findOne({
                where: {
                    id: req.params.measurementId,
                    biotopeId: biotope.id,
                },
            });

            if (!measurement) throw new MeasurementNotFoundApiError();

            await measurement.destroy();

            res.status(204).send();
        },
    );

    await fastify.register(import("./subscriptions/generic"), {
        prefix: "/subscriptions",
    });
}) satisfies FastifyPluginAsync;
