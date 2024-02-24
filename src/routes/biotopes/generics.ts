import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    const schemaBiotopeType = /\/(\w+)s\/:id/.exec(instance.prefix)?.[1];
    if (!schemaBiotopeType) return;

    instance.get(
        "/image",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Get an ${schemaBiotopeType} image`,
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

    instance.delete(
        "/",
        {
            schema: {
                tags: [`${schemaBiotopeType}s`],
                description: `Delete an ${schemaBiotopeType}`,
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

    await fastify.register(import("./measurements/generics"), {
        prefix: "/measurements",
    });
}) satisfies FastifyPluginAsync;
