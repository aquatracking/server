import { FastifyAuthFunction } from "@fastify/auth";
import { env } from "../env";
import { NotLoggedApiError } from "../errors/ApiError/NotLoggedApiError";
import * as jwt from "../jwt";
import { ApplicationModel } from "../model/ApplicationModel";

export const isApplicationLoggedIn = (async (req, res) => {
    const token = req.headers["x-api-key"] as string;

    if (!token) {
        throw new NotLoggedApiError();
    }

    const jwtUser = await jwt.verify(token, env.APPLICATION_TOKEN_SECRET);

    if (!jwtUser.id) {
        throw new NotLoggedApiError();
    }

    const application = await ApplicationModel.findOne({
        where: {
            userId: jwtUser.id as string,
            token: token,
        },
    });

    const user = await application?.getUserModel();

    if (!application || !user || user.deleteAt) {
        throw new NotLoggedApiError();
    }

    req.user = user;
}) satisfies FastifyAuthFunction;
