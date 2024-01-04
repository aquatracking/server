import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ApplicationCreateDtoSchema } from "../dto/application/applicationCreateDto";
import { ApplicationCreatedDtoSchema } from "../dto/application/applicationCreatedDto";
import UserTokenUtil from "../utils/UserTokenUtil";
import { UserDtoSchema } from "../dto/user/userDto";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    instance.post(
        "/",
        {
            schema: {
                tags: ["applications"],
                description: "Register a new application",
                body: ApplicationCreateDtoSchema,
                response: {
                    201: ApplicationCreatedDtoSchema,
                },
            },
        },
        async function (req, res) {
            const token = await UserTokenUtil.generateApplicationToken(
                UserDtoSchema.parse(req.user!),
            );

            const application = await req.user!.createApplicationModel({
                ...req.body,
                token: token,
            });

            res.status(201).send(
                ApplicationCreatedDtoSchema.parse(application),
            );
        },
    );
}) satisfies FastifyPluginAsync;
