import { FastifyAuthFunction } from "@fastify/auth";
import { NotLoggedApiError } from "../errors/ApiError/NotLoggedApiError";
import { UserNotAdminApiError } from "../errors/ApiError/UserNotAdminApiError";

export const isAdminLoggedIn = (async (req, res) => {
    if (!req.user) {
        throw new NotLoggedApiError();
    }

    if (!req.user.isAdmin) {
        throw new UserNotAdminApiError();
    }
}) satisfies FastifyAuthFunction;
