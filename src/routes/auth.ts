import bcrypt from "bcryptjs";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { UAParser } from "ua-parser-js";
import { z } from "zod";
import MailSender from "../agents/MailSender";
import { UserCreateDtoSchema } from "../dto/user/userCreateDto";
import { UserDtoSchema } from "../dto/user/userDto";
import { env } from "../env";
import { EmailAlreadyExistApiError } from "../errors/ApiError/EmailAlreadyExistApiError";
import { NotLoggedApiError } from "../errors/ApiError/NotLoggedApiError";
import { OTPRequiredApiError } from "../errors/ApiError/OTPRequiredApiError";
import { UserNotFoundApiError } from "../errors/ApiError/UserNotFoundApiError";
import { UsernameAlreadyExistApiError } from "../errors/ApiError/UsernameAlreadyExistApiError";
import { WrongOTPApiError } from "../errors/ApiError/WrongOTPApiError";
import { WrongPasswordApiError } from "../errors/ApiError/WrongPasswordApiError";
import { UserModel } from "../model/UserModel";
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
                    409: z.union([
                        UsernameAlreadyExistApiError.schema,
                        EmailAlreadyExistApiError.schema,
                    ]),
                },
            },
            config: {
                rateLimit: {
                    max: 10,
                    timeWindow: "1 minute",
                },
            },
        },
        async function (req, res) {
            if (!env.REGISTRATION_ENABLED) {
                return res.status(403).send();
            }

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
                    otp: z.string().length(6).optional(),
                }),
                response: {
                    200: UserDtoSchema,
                    404: UserNotFoundApiError.schema,
                    403: z.union([
                        WrongPasswordApiError.schema,
                        WrongOTPApiError.schema,
                        OTPRequiredApiError.schema,
                    ]),
                },
            },
            config: {
                rateLimit: {
                    max: 10,
                    timeWindow: "5 minute",
                },
            },
        },
        async function (req, res) {
            const user = await UserModel.findOne({
                where: {
                    email: req.body.email,
                    deleteAt: null,
                },
            });

            if (!user) {
                throw new UserNotFoundApiError();
            }

            await user.checkPassword(req.body.password);
            user.checkOTP(req.body.otp);

            const userDto = UserDtoSchema.parse(user);

            // Generate token
            const token = await UserTokenUtil.generateSessionToken(userDto);

            // Get User Agent
            const ua = new UAParser(req.headers["user-agent"]);
            const browser = ua.getBrowser();
            const os = ua.getOS();

            await UserSessionModel.create({
                name:
                    browser.name || os.name
                        ? `${browser.name ?? "Unknown"} - ${os.name ?? "Unknown"}`
                        : "Unknown",
                userId: userDto.id,
                token: token,
            });

            // Send cookies
            res.setCookie("session-token", token, {
                maxAge: 1000 * 60 * 60 * 24 * 7 * 365,
                path: "/",
                httpOnly: true,
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
                    401: NotLoggedApiError.schema,
                },
            },
        },
        async function (req, res) {
            const token = req.cookies["session-token"];

            if (!token) {
                throw new NotLoggedApiError();
            }

            const session = await UserSessionModel.findOne({
                where: {
                    token: token,
                },
            });

            if (!session) {
                throw new NotLoggedApiError();
            }

            await session.destroy();

            res.clearCookie("session-token");

            return res.status(204).send();
        },
    );
}) satisfies FastifyPluginAsync;
