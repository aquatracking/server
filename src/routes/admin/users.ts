import bcrypt from "bcryptjs";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AdminUserDtoSchema } from "../../dto/admin/user/AdminUserDto";
import { UserCreateDtoSchema } from "../../dto/user/userCreateDto";
import { CantDeleteItSelfApiError } from "../../errors/ApiError/CantDeleteItSelf";
import { EmailAlreadyExistApiError } from "../../errors/ApiError/EmailAlreadyExistApiError";
import { OTPRequiredApiError } from "../../errors/ApiError/OTPRequiredApiError";
import { UserNotFoundApiError } from "../../errors/ApiError/UserNotFoundApiError";
import { UsernameAlreadyExistApiError } from "../../errors/ApiError/UsernameAlreadyExistApiError";
import { WrongOTPApiError } from "../../errors/ApiError/WrongOTPApiError";
import { WrongPasswordApiError } from "../../errors/ApiError/WrongPasswordApiError";
import { UserModel } from "../../model/UserModel";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    instance.get(
        "/",
        {
            schema: {
                tags: ["admin", "users"],
                description: "Get all users",
                response: {
                    200: AdminUserDtoSchema.array(),
                },
            },
        },
        async function () {
            const users = await UserModel.findAll();

            return users.map((user) => AdminUserDtoSchema.parse(user));
        },
    );

    instance.get(
        "/:id",
        {
            schema: {
                tags: ["admin", "users"],
                description: "Get a user",
                params: z.object({
                    id: z.string().uuid(),
                }),
                response: {
                    200: AdminUserDtoSchema,
                    404: UserNotFoundApiError.schema,
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
                throw new UserNotFoundApiError();
            }

            return AdminUserDtoSchema.parse(user);
        },
    );

    instance.delete(
        "/:id",
        {
            schema: {
                tags: ["admin", "users"],
                description:
                    "Delete a user. The data will be definitely lost after 30 days.",
                params: z.object({
                    id: z.string().uuid(),
                }),
                body: z.object({
                    password: z.string(),
                    otp: z.string().length(6).optional(),
                }),
                response: {
                    204: z.void(),
                    400: CantDeleteItSelfApiError.schema,
                    404: UserNotFoundApiError.schema,
                    403: z.union([
                        WrongPasswordApiError.schema,
                        WrongOTPApiError.schema,
                        OTPRequiredApiError.schema,
                    ]),
                },
            },
        },
        async function (req, res) {
            const connectedUser = req.user!;

            await connectedUser.checkPassword(req.body.password);
            connectedUser.checkOTP(req.body.otp);

            const user = await UserModel.findOne({
                where: {
                    id: req.params.id,
                },
            });

            if (!user) {
                throw new UserNotFoundApiError();
            }

            if (user === connectedUser) {
                throw new CantDeleteItSelfApiError();
            }

            user.deleteAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            user.destroyAllSessions();

            await user.save();

            return res.status(204).send();
        },
    );

    instance.post(
        "/",
        {
            schema: {
                tags: ["admin", "users"],
                description: "Create a user",
                body: UserCreateDtoSchema,
                response: {
                    201: AdminUserDtoSchema,
                    409: z.union([
                        UsernameAlreadyExistApiError.schema,
                        EmailAlreadyExistApiError.schema,
                    ]),
                },
            },
        },
        async function (req, res) {
            const emailExists = await UserModel.findOne({
                where: {
                    email: req.body.email,
                },
            });

            const usernameExists = await UserModel.findOne({
                where: {
                    username: req.body.username,
                },
            });

            if (emailExists) {
                throw new EmailAlreadyExistApiError();
            }

            if (usernameExists) {
                throw new UsernameAlreadyExistApiError();
            }

            const hashPassword = await bcrypt.hash(req.body.password, 10);

            const user = await UserModel.create({
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
                verified: true,
            });

            res.status(201).send(AdminUserDtoSchema.parse(user));
        },
    );
}) satisfies FastifyPluginAsync;
