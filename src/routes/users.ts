import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { UserDtoSchema } from "../dto/user/userDto";
import UserModel from "../model/UserModel";

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    // TODO: to move in a admin dedicated route
    // instance.get(
    //     "/",
    //     {
    //         schema: {
    //             tags: ["users"],
    //             description: "Get all users",
    //             response: {
    //                 200: UserDtoSchema.array(),
    //             },
    //         },
    //     },
    //     async function () {
    //         const users = await UserModel.findAll();

    //         return users.map((user) => UserDtoSchema.parse(user));
    //     },
    // );

    instance.get(
        "/:id",
        {
            schema: {
                tags: ["users"],
                description: "Get a user",
                params: z.object({
                    id: z.string().uuid(),
                }),
                response: {
                    200: UserDtoSchema,
                },
            },
        },
        async function (req, res) {
            const user = await UserModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!user) {
                return res.status(404);
            }

            return UserDtoSchema.parse(user);
        },
    );

    instance.delete(
        "/:id",
        {
            schema: {
                tags: ["users"],
                description: "Delete a user",
                params: z.object({
                    id: z.string().uuid(),
                }),
            },
        },
        async function (req, res) {
            const user = await UserModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!user) {
                return res.status(404);
            }

            await user.destroy();

            return res.status(204).send();
        },
    );

    instance.get(
        "/me",
        {
            schema: {
                tags: ["users"],
                description: "Get the current user",
                response: {
                    200: UserDtoSchema,
                },
            },
        },
        async function (req, res) {
            return UserDtoSchema.parse(req.user);
        },
    );
}) satisfies FastifyPluginAsync;
