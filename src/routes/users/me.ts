import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import otpGenerator from "otp-generator";
import { authenticator } from "otplib";
import { z } from "zod";
import MailSender from "../../agents/MailSender";
import { UserDtoSchema } from "../../dto/user/userDto";
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
            },
        },
        async function (req, res) {
            const userEmail = req.user!.email;

            if (req.user!.verified) {
                return res.status(400).send("EMAIL_ALREADY_VERIFIED");
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

            return res.status(204).send();
        },
    );

    instance.post(
        "/verify-email/verify-code",
        {
            schema: {
                tags: ["users"],
                description: `Verify the user's email with the code sent. Use ${instance.prefix}/verify-email/send-code to send a code.`,
                body: z.object({
                    code: z.string(),
                }),
            },
        },
        async function (req, res) {
            if (req.user!.verified) {
                return res.status(400).send("EMAIL_ALREADY_VERIFIED");
            }

            let emailToken = await EmailValidationOTPModel.findOne({
                where: {
                    email: req.user!.email,
                },
            });

            if (!emailToken) {
                return res.status(403).send("NO_EMAIL_VERIFICATION_CODE");
            } else if (emailToken.expiresAt < new Date()) {
                await emailToken.destroy();
                return res.status(403).send("EMAIL_VERIFICATION_CODE_EXPIRED");
            } else if (emailToken.code !== req.body.code) {
                return res.status(403).send("INVALID_EMAIL_VERIFICATION_CODE");
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
            },
        },
        async function (req, res) {
            if (req.user!.totpEnabled) {
                return res.status(400).send("TOTP_ALREADY_ENABLED");
            }

            const secret = authenticator.generateSecret();

            console.log(authenticator.generate(secret));

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
            },
        },
        async function (req, res) {
            if (!req.user!.totpSecret) {
                return res.status(400).send("NO_TOTP_SECRET");
            }

            if (req.user!.totpEnabled) {
                return res.status(400).send("TOTP_ALREADY_ENABLED");
            }

            const verified = authenticator.verify({
                token: req.body.otp,
                secret: req.user!.totpSecret,
            });

            if (!verified) {
                return res.status(403).send("INVALID_TOTP_CODE");
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
                    otp: z.string().length(6),
                }),
            },
        },
        async function (req, res) {
            if (!req.user!.totpEnabled) {
                return res.status(400).send("TOTP_NOT_ENABLED");
            }

            if (!req.user!.totpSecret) {
                return res.status(500).send("NO_TOTP_SECRET");
            }

            if (
                !authenticator.verify({
                    token: req.body.otp,
                    secret: req.user!.totpSecret,
                })
            ) {
                return res.status(403).send("INVALID_TOTP_CODE");
            }

            req.user!.totpSecret = undefined;
            req.user!.totpEnabled = false;

            await req.user!.save();

            return res.status(200).send();
        },
    );

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
    //
    //         return users.map((user) => UserDtoSchema.parse(user));
    //     },
    // );

    // TODO: to move in a admin dedicated route
    // instance.get(
    //     "/:id",
    //     {
    //         schema: {
    //             tags: ["users"],
    //             description: "Get a user",
    //             params: z.object({
    //                 id: z.string().uuid(),
    //             }),
    //             response: {
    //                 200: UserDtoSchema,
    //             },
    //         },
    //     },
    //     async function (req, res) {
    //         const user = await UserModel.findOne({
    //             where: {
    //                 id: req.params.id,
    //             },
    //         });
    //
    //         if (!user) {
    //             return res.status(404);
    //         }
    //
    //         return UserDtoSchema.parse(user);
    //     },
    // );

    // TODO: to move in a admin dedicated route
    // instance.delete(
    //     "/:id",
    //     {
    //         schema: {
    //             tags: ["users"],
    //             description: "Delete a user",
    //             params: z.object({
    //                 id: z.string().uuid(),
    //             }),
    //         },
    //     },
    //     async function (req, res) {
    //         const user = await UserModel.findOne({
    //             where: {
    //                 id: req.params.id,
    //             },
    //         });
    //
    //         if (!user) {
    //             return res.status(404);
    //         }
    //
    //         await user.destroy();
    //
    //         return res.status(204).send();
    //     },
    // );

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
}) satisfies FastifyPluginAsync;
