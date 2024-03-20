import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import otpGenerator from "otp-generator";
import { authenticator } from "otplib";
import { z } from "zod";
import MailSender from "../../agents/MailSender";
import { UserDtoSchema } from "../../dto/user/userDto";
import { EmailAlreadyVerifiedApiError } from "../../errors/ApiError/EmailAlreadyVerifiedApiError";
import { ExpiredEmailVerificationCodeApiError } from "../../errors/ApiError/ExpiredEmailVerificationCodeApiError";
import { InvalidEmailVerificationCodeApiError } from "../../errors/ApiError/InvalidEmailVerificationCodeApiError";
import { NoEmailVerificationCodeApiError } from "../../errors/ApiError/NoEmailVerificationCodeApiError";
import { NoTOTPSecretApiError } from "../../errors/ApiError/NoTOTPSecretApiError";
import { OTPRequiredApiError } from "../../errors/ApiError/OTPRequiredApiError";
import { TOTPAlreadyEnabledApiError } from "../../errors/ApiError/TOTPAlreadyEnabledApiError";
import { TOTPNotEnabledApiError } from "../../errors/ApiError/TOTPNotEnabledApiError";
import { WrongOTPApiError } from "../../errors/ApiError/WrongOTPApiError";
import { WrongPasswordApiError } from "../../errors/ApiError/WrongPasswordApiError";
import { EmailValidationOTPModel } from "../../model/EmailValidationOTPModel";

export default (async (fastify) => {
    const instance = fastify.withTypeProvider<ZodTypeProvider>();

    instance.post(
        "/verify-email/send-code",
        {
            schema: {
                tags: ["users"],
                description:
                    "Send a code to the connected user's email to verify it. The code is valid for 5 minutes.",
                response: {
                    200: z.void(),
                    409: EmailAlreadyVerifiedApiError.schema,
                },
            },
        },
        async function (req, res) {
            const userEmail = req.user!.email;

            if (req.user!.verified) {
                throw new EmailAlreadyVerifiedApiError();
            }

            let oldEmailToken = await EmailValidationOTPModel.findOne({
                where: {
                    email: userEmail,
                },
            });

            if (oldEmailToken) {
                oldEmailToken.destroy();
            }

            const emailToken = await EmailValidationOTPModel.create({
                email: userEmail,
                code: otpGenerator.generate(6, {
                    digits: true,
                    lowerCaseAlphabets: false,
                    upperCaseAlphabets: false,
                    specialChars: false,
                }),
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            });

            MailSender.send(
                userEmail,
                "Validation de votre adresse email",
                `Bonjour,\n\nVoici votre code de validation: ${emailToken.code}\n\nCe code est valable 5 minutes.`,
            );

            return res.status(200).send();
        },
    );

    instance.post(
        "/verify-email/verify-code",
        {
            schema: {
                tags: ["users"],
                description: `Verify the user's email with the code sent. Use ${instance.prefix}/verify-email/send-code to send a code.`,
                body: z.object({
                    code: z.string().length(6),
                }),
                response: {
                    200: z.void(),
                    403: z.union([
                        NoEmailVerificationCodeApiError.schema,
                        ExpiredEmailVerificationCodeApiError.schema,
                        InvalidEmailVerificationCodeApiError.schema,
                    ]),
                    409: EmailAlreadyVerifiedApiError.schema,
                },
            },
        },
        async function (req, res) {
            if (req.user!.verified) {
                throw new EmailAlreadyVerifiedApiError();
            }

            let emailToken = await EmailValidationOTPModel.findOne({
                where: {
                    email: req.user!.email,
                },
            });

            if (!emailToken) {
                throw new NoEmailVerificationCodeApiError();
            } else if (emailToken.expiresAt < new Date()) {
                await emailToken.destroy();
                throw new ExpiredEmailVerificationCodeApiError();
            } else if (emailToken.code !== req.body.code) {
                throw new InvalidEmailVerificationCodeApiError();
            }

            req.user!.verified = true;
            await req.user!.save();

            await emailToken.destroy();

            return res.status(200).send();
        },
    );

    instance.post(
        "/totp/enable",
        {
            schema: {
                tags: ["users"],
                description: `Enable TOTP for the connected user. Will need verify with ${instance.prefix}/totp/enable/verify.`,
                body: z.object({
                    password: z.string(),
                }),
                response: {
                    200: z.object({
                        otpUri: z.string(),
                    }),
                    400: TOTPAlreadyEnabledApiError.schema,
                    403: WrongPasswordApiError.schema,
                },
            },
        },
        async function (req, res) {
            if (req.user!.totpEnabled) {
                throw new TOTPAlreadyEnabledApiError();
            }

            await req.user!.checkPassword(req.body.password);

            const secret = authenticator.generateSecret();

            req.user!.totpSecret = secret;

            await req.user!.save();

            return res.status(200).send({
                otpUri: authenticator.keyuri(
                    req.user!.username,
                    "Aquatracking",
                    secret,
                ),
            });
        },
    );

    instance.post(
        "/totp/enable/verify",
        {
            schema: {
                tags: ["users"],
                description: `Verify the TOTP code for the connected user. Use ${instance.prefix}/totp/enable to enable TOTP.`,
                body: z.object({
                    otp: z.string().length(6),
                }),
                response: {
                    200: z.void(),
                    400: z.union([
                        NoTOTPSecretApiError.schema,
                        TOTPAlreadyEnabledApiError.schema,
                    ]),
                    403: WrongOTPApiError.schema,
                },
            },
        },
        async function (req, res) {
            if (!req.user!.totpSecret) {
                throw new NoTOTPSecretApiError();
            }

            if (req.user!.totpEnabled) {
                throw new TOTPAlreadyEnabledApiError();
            }

            const verified = authenticator.verify({
                token: req.body.otp,
                secret: req.user!.totpSecret,
            });

            if (!verified) {
                throw new WrongOTPApiError();
            }

            req.user!.totpEnabled = true;

            await req.user!.save();

            return res.status(200).send();
        },
    );

    instance.post(
        "/totp/disable",
        {
            schema: {
                tags: ["users"],
                description: `Disable TOTP for the connected user.`,
                body: z.object({
                    password: z.string(),
                    otp: z.string().length(6),
                }),
                response: {
                    200: z.void(),
                    400: TOTPNotEnabledApiError.schema,
                    403: z.union([
                        WrongPasswordApiError.schema,
                        WrongOTPApiError.schema,
                    ]),
                },
            },
        },
        async function (req, res) {
            if (!req.user!.totpEnabled) {
                throw new TOTPNotEnabledApiError();
            }

            await req.user!.checkPassword(req.body.password);
            req.user!.checkOTP(req.body.otp);

            req.user!.totpSecret = null;
            req.user!.totpEnabled = false;

            await req.user!.save();

            return res.status(200).send();
        },
    );

    instance.delete(
        "/",
        {
            schema: {
                tags: ["users"],
                description:
                    "Delete the connected user. The data will be definitely lost after 30 days.",
                body: z.object({
                    password: z.string(),
                    otp: z.string().length(6).optional(),
                }),
                response: {
                    204: z.void(),
                    401: z.union([z.string(), z.number()]),
                    403: z.union([
                        WrongPasswordApiError.schema,
                        WrongOTPApiError.schema,
                        OTPRequiredApiError.schema,
                    ]),
                },
            },
        },
        async function (req, res) {
            const user = req.user!;

            await user.checkPassword(req.body.password);
            user.checkOTP(req.body.otp);

            user.deleteAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            user.destroyAllSessions();

            await user.save();

            return res.status(204).send();
        },
    );

    instance.get(
        "/",
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

    instance.register(import("./me/session"), {
        prefix: "/session",
    });
}) satisfies FastifyPluginAsync;
