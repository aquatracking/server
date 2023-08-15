import Router from "express";
import * as jwt from "../jwt";
import BadRequestError from "../errors/BadRequestError";
import ApplicationModel from "../model/ApplicationModel";
import ApplicationDto from "../dto/ApplicationDto";
import { env } from '../env';
import { tryPromise } from "../utils/tryPromise";
import { ApplicationTokenDto } from "../dto/ApplicationTokenDto";

const router = Router();

/* Post a new application. */
router.post("/", async function (req, res) {
    const currentUser = req.user!;
    const applicationTokenData = {
        name: req.body.name,
        description: req.body.description,
        user: currentUser,
    } satisfies ApplicationTokenDto;
    const signTokenResult = await tryPromise(
        jwt.sign(applicationTokenData, env.APPLICATION_TOKEN_SECRET)
    );
    if (!signTokenResult.success) {
        // TODO: handle error
        return res.status(500).json();
    }

    const addApplicationResult = await tryPromise(
        ApplicationModel.addApplication({
            name: req.body.name,
            description: req.body.description,
            token: signTokenResult.result,
        }, currentUser)
    );
    if (!addApplicationResult.success) {
        const error = addApplicationResult.error;
        console.log(error);
        res.status(error instanceof BadRequestError ? 400 : 500).json();
        return;
    }

    const application = addApplicationResult.result;
    res.json(new ApplicationDto(application));
});

module.exports = router;
