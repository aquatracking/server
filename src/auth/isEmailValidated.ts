import { FastifyAuthFunction } from "@fastify/auth";
import { EmailNotValidatedApiError } from "../errors/ApiError/EmailNotValidatedApiError";
import { NotLoggedApiError } from "../errors/ApiError/NotLoggedApiError";

export const isEmailValidated = (async (req, res) => {
    if (!req.user) {
        throw new NotLoggedApiError();
    }

    if (!req.user.verified) {
        throw new EmailNotValidatedApiError();
    }
}) satisfies FastifyAuthFunction;
