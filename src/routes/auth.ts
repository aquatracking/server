import { FastifyPluginAsync } from "fastify";
import { UserCreateDtoSchema } from "../dto/user/userCreateDto";
import { UserDtoSchema } from "../dto/user/userDto";
import UserModel from "../model/UserModel";

import bcrypt from "bcryptjs";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import MailSender from "../agents/MailSender";
import { UserSessionModel } from "../model/UserSessionModel";
import UserTokenUtil from "../utils/UserTokenUtil";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    instance.post(
        "/register",
        {
            schema: {
                tags: ["auth"],
                description: "Register a new user",
                body: UserCreateDtoSchema,
                response: {
                    201: UserDtoSchema,
                },
            },
        },
        async function (req, res) {
            const hashPassword = await bcrypt.hash(req.body.password, 10);

            const user = await UserModel.create({
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
            });

            res.status(201).send(UserDtoSchema.parse(user));
        },
    );

    instance.post(
        "/login",
        {
            schema: {
                tags: ["auth"],
                description:
                    "Login a user and return a session token in a cookie",
                body: z.object({
                    email: z.string().email(),
                    password: z.string(),
                }),
            },
        },
        async function (req, res) {
            console.log(req.headers["user-agent"]);
            const user = await UserModel.findOne({
                where: {
                    email: req.body.email,
                },
            });

            if (!user) {
                return res.status(404).send();
            }

            const isPasswordValid = await bcrypt.compare(
                req.body.password,
                user.password,
            );
            if (!isPasswordValid) {
                return res.status(403).send();
            }

            const userDto = UserDtoSchema.parse(user);

            // Send cookies
            const token = await UserTokenUtil.generateSessionToken(userDto);
            res.setCookie("session-token", token, {
                maxAge: 1000 * 60 * 60 * 24 * 7 * 365,
                path: "/",
                httpOnly: true,
            });

            UserSessionModel.create({
                name: "Unknown device",
                userId: userDto.id,
                token: token,
            });

            // Send Mail
            MailSender.send(
                userDto.email,
                "Connexion à Aquatracking",
                `Bonjour ${userDto.username},\n\nVous venez de vous connecter à votre compte Aquatracking depuis l'adresse IP ${req.ip}.\n\nSi vous n'êtes pas à l'origine de cette connexion, veuillez contacter l'administrateur du site.`,
            );
            return userDto;
        },
    );

    instance.post(
        "/logout",
        {
            schema: {
                tags: ["auth"],
                description: "Logout a user and delete his session",
                response: {
                    204: z.void(),
                },
            },
        },
        async function (req, res) {
            const token = req.cookies["session-token"];

            if (!token) {
                return res.status(401).send();
            }

            const session = await UserSessionModel.findOne({
                where: {
                    token: token,
                },
            });

            if (!session) {
                return res.status(401).send();
            }

            await session.destroy();

            res.clearCookie("session-token");

            return res.status(204).send();
        },
    );
}) satisfies FastifyPluginAsync;
