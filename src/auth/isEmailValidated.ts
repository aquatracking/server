import { FastifyAuthFunction } from "@fastify/auth";
import { NotEmailValidatedError } from "../errors/NotEmailValidatedError";
import { NotLoggedError } from "../errors/NotLoggedError";

export const isEmailValidated = (async (req, res) => {
    if (!req.user) {
        throw new NotLoggedError();
    }

    if (!req.user.verified) {
        throw new NotEmailValidatedError();
    }
}) satisfies FastifyAuthFunction;
