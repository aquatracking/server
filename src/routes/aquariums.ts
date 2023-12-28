import { FastifyPluginAsync } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { AquariumDtoSchema } from "../dto/aquarium/AquariumDto";
import { AquariumCreateDtoSchema } from "../dto/aquarium/AquariumCreateDto";
import AquariumModel from "../model/AquariumModel";
import { z } from "zod";
import { AquariumUpdateDtoSchema } from "../dto/aquarium/AquariumUpdateDto";

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
}) satisfies FastifyPluginAsync;
