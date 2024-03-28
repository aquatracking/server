import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { MeasurementTypeDtoSchema } from "../dto/measurementType/MeasurementTypeDto";
import { MeasurementTypeModel } from "../model/MeasurementTypeModel";
import { z } from "zod";
import { MeasurementTypeNotFoundApiError } from "../errors/ApiError/MeasurementTypeNotFoundApiError";
import { injectTagSchemaInRouteOption } from "../utils/routeOptionInjection";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    instance.addHook("onRoute", (routeOptions) => {
        injectTagSchemaInRouteOption(routeOptions, "measurementTypes");
    });

    instance.get(
        "/",
        {
            schema: {
                description: "Get all measurement types",
                response: {
                    200: MeasurementTypeDtoSchema.array(),
                },
            },
        },
        async function () {
            const measurementTypes = await MeasurementTypeModel.findAll();

            return measurementTypes.map((measurementType) =>
                MeasurementTypeDtoSchema.parse(measurementType),
            );
        },
    );

    instance.get(
        "/:code",
        {
            schema: {
                description: "Get a measurement type",
                params: z.object({
                    code: z.string(),
                }),
                response: {
                    200: MeasurementTypeDtoSchema,
                    404: MeasurementTypeNotFoundApiError.schema,
                },
            },
        },
        async function (req) {
            const measurementType = await MeasurementTypeModel.findOne({
                where: {
                    code: req.params.code,
                },
            });

            if (!measurementType) {
                throw new MeasurementTypeNotFoundApiError();
            }

            return MeasurementTypeDtoSchema.parse(measurementType);
        },
    );
}) satisfies FastifyPluginAsync;
