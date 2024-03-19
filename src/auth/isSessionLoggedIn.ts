import { FastifyAuthFunction } from "@fastify/auth";
import { NotLoggedApiError } from "../errors/ApiError/NotLoggedApiError";
import * as jwt from "../jwt";
import { UserSessionModel } from "../model/UserSessionModel";
import { env } from "../env";

export const isSessionLoggedIn = (async (req, res) => {
    const token = req.cookies["session-token"];

    if (!token) {
        throw new NotLoggedApiError();
    }

    const jwtUser = await jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    const session = await UserSessionModel.findOne({
        where: {
            userId: jwtUser.id,
            token: token,
        },
    });

    const user = await session?.getUserModel();

    if (!session || !user || user.deleteAt) {
        throw new NotLoggedApiError();
    }

    session.lastConnectionDate = new Date();

    await session.save();

    req.user = user;
    req.session = session;
}) satisfies FastifyAuthFunction;
