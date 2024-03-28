import { ZodTypeAny, z } from "zod";

export function injectResponseSchemaInRouteOption(
    routeOptions: any,
    statusCode: number,
    schema: z.ZodType,
): void {
    if (routeOptions.method === "HEAD" || routeOptions.method === "OPTIONS") {
        return;
    }

    if (!routeOptions.schema) {
        routeOptions.schema = {};
    }

    if (!routeOptions.schema.response) {
        routeOptions.schema.response = {};
    }

    if (!routeOptions.schema.response[200] && statusCode !== 200) {
        routeOptions.schema.response[200] = z.void();
    }

    if (
        !routeOptions.schema.response[statusCode] ||
        routeOptions.schema.response[statusCode] instanceof z.ZodVoid
    ) {
        routeOptions.schema.response[statusCode] = schema;
        return;
    }

    if (!(routeOptions.schema.response[statusCode] instanceof z.ZodType)) {
        throw new Error("Not a valid Zod schema in route options.");
    }

    if (routeOptions.schema.response[statusCode] instanceof z.ZodUnion) {
        routeOptions.schema.response[statusCode] = z.union([
            ...(routeOptions.schema.response[statusCode]._def
                .options as readonly [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]),
            schema,
        ]);
        return;
    }

    routeOptions.schema.response[statusCode] = z.union([
        routeOptions.schema.response[statusCode],
        schema,
    ]);
}

export function injectParamSchemaInRouteOption(
    routeOptions: any,
    schema: z.ZodObject<any, any, any>,
): void {
    if (routeOptions.method === "HEAD" || routeOptions.method === "OPTIONS") {
        return;
    }

    if (!routeOptions.schema) {
        routeOptions.schema = {};
    }

    if (!routeOptions.schema.params) {
        routeOptions.schema.params = z.object({});
    }

    if (!(routeOptions.schema.params instanceof z.ZodObject)) {
        throw new Error("Not a valid Zod object in route options.");
    }

    routeOptions.schema.params = routeOptions.schema.params.merge(schema);
}

export function injectTagSchemaInRouteOption(
    routeOptions: any,
    tag: string,
): void {
    if (routeOptions.method === "HEAD" || routeOptions.method === "OPTIONS") {
        return;
    }

    if (!routeOptions.schema) {
        routeOptions.schema = {};
    }

    if (!routeOptions.schema.tags) {
        routeOptions.schema.tags = [];
    }

    if (!routeOptions.schema.tags.includes(tag)) {
        routeOptions.schema.tags.push(tag);
    }
}
