import { FastifyAuthFunction } from "@fastify/auth";
import { env } from "../env";
import { NotLoggedError } from "../errors/NotLoggedError";
import * as jwt from "../jwt";
import { ApplicationModel } from "../model/ApplicationModel";

export const isApplicationLoggedIn = (async (req, res) => {
    const token = req.headers["x-api-key"] as string;

    if (!token) {
        throw new NotLoggedError();
    }

    const jwtUser = await jwt.verify(token, env.APPLICATION_TOKEN_SECRET!);

    if (!jwtUser.id) {
        throw new NotLoggedError();
    }

    const application = await ApplicationModel.findOne({
        where: {
            userId: jwtUser.id as string,
            token: token,
        },
    });

    const user = await application?.getUserModel();

    if (!application || !user) {
        throw new NotLoggedError();
    }

    req.user = user;
}) satisfies FastifyAuthFunction;
