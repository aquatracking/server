import Router from "express";
import { ApplicationCreateDtoSchema } from "../dto/application/applicationCreateDto";
import { env } from "../env";
import * as jwt from "../jwt";
import ApplicationModel from "../model/ApplicationModel";
import { ApplicationDtoSchema } from "../dto/application/applicationDto";

const router = Router();

/* Post a new application. */
router.post("/", async function (req, res, next) {
    const currentUser = req.user!;

    const applicationCreateDto = ApplicationCreateDtoSchema.parse(req.body);

    const signToken = await jwt.sign(
        {
            ...applicationCreateDto,
            user: currentUser,
        },
        env.APPLICATION_TOKEN_SECRET,
    );

    ApplicationModel.create({
        ...applicationCreateDto,
        token: signToken,
        userId: currentUser.id,
    })
        .then((application) => {
            res.json(ApplicationDtoSchema.parse(application));
        })
        .catch((e) => {
            next(e);
        });
});

module.exports = router;
