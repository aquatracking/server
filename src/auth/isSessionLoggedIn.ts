import { FastifyAuthFunction } from "@fastify/auth";
import { NotLoggedError } from "../errors/NotLoggedError";
import * as jwt from "../jwt";
import { UserSessionModel } from "../model/UserSessionModel";

export const isSessionLoggedIn = (async (req, res) => {
    const token = req.cookies["session-token"];

    if (!token) {
        throw new NotLoggedError();
    }

    const jwtUser = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

    const session = await UserSessionModel.findOne({
        where: {
            userId: jwtUser.id,
            token: token,
        },
    });

    const user = await session?.getUserModel();

    if (!session || !user) {
        throw new NotLoggedError();
    }

    session.lastConnectionDate = new Date();

    await session.save();

    req.user = user;
}) satisfies FastifyAuthFunction;
