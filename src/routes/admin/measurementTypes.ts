import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { MeasurementTypeCreateDtoSchema } from "../../dto/measurementType/MeasurementTypeCreateDto";
import { MeasurementTypeDtoSchema } from "../../dto/measurementType/MeasurementTypeDto";
import { MeasurementTypeUpdateDtoSchema } from "../../dto/measurementType/MeasurementTypeUpdateDto";
import { MeasurementTypeModel } from "../../model/MeasurementTypeModel";

import { z } from "zod";
import { CantDeleteUsedMeasurementTypeApiError } from "../../errors/ApiError/CantDeleteUsedMeasurementTypeApiError";
import { MeasurementTypeNotFoundApiError } from "../../errors/ApiError/MeasurementTypeNotFoundApiError";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    instance.post(
        "/",
        {
            schema: {
                tags: ["admin", "measurementTypes"],
                description: "Create a new measurement type",
                body: MeasurementTypeCreateDtoSchema,
                response: {
                    201: MeasurementTypeDtoSchema,
                },
            },
        },
        async function (req, res) {
            const measurementType = await MeasurementTypeModel.create(req.body);

            res.status(201).send(
                MeasurementTypeCreateDtoSchema.parse(measurementType),
            );
        },
    );

    instance.patch(
        "/:code",
        {
            schema: {
                tags: ["admin", "measurementTypes"],
                description: "Update a measurement type",
                params: z.object({
                    code: z.string(),
                }),
                body: MeasurementTypeUpdateDtoSchema.partial(),
                response: {
                    200: MeasurementTypeDtoSchema,
                    404: MeasurementTypeNotFoundApiError.schema,
                },
            },
        },
        async function (req, res) {
            const measurementType = await MeasurementTypeModel.findOne({
                where: {
                    code: req.params.code,
                },
            });

            if (!measurementType) {
                throw new MeasurementTypeNotFoundApiError();
            }

            await measurementType.update(req.body);

            res.send(MeasurementTypeDtoSchema.parse(measurementType));
        },
    );

    instance.delete(
        "/:code",
        {
            schema: {
                tags: ["admin", "measurementTypes"],
                description: "Delete a measurement type",
                params: z.object({
                    code: z.string(),
                }),
                response: {
                    204: z.void(),
                    404: MeasurementTypeNotFoundApiError.schema,
                    409: CantDeleteUsedMeasurementTypeApiError.schema,
                },
            },
        },
        async function (req, res) {
            const measurementType = await MeasurementTypeModel.findOne({
                where: {
                    code: req.params.code,
                },
            });

            if (!measurementType) {
                throw new MeasurementTypeNotFoundApiError();
            }

            await measurementType.destroy();

            res.status(204).send();
        },
    );
}) satisfies FastifyPluginAsync;
