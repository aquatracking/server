import Router from 'express';
import * as jwt from "../jwt";
import BadRequestError from "../errors/BadRequestError";
import ApplicationModel from "../model/ApplicationModel";
import ApplicationDto from "../dto/ApplicationDto";
import { env } from '../env';

const router = Router();

/* Post a new application. */
router.post('/', async function (req, res, next) {
    let token: string;
    try {
        token = await jwt.sign({
            name: req.body.name,
            description: req.body.description,
            user: req.user
        }, env.APPLICATION_TOKEN_SECRET)
    } catch(err) {
        console.error("error while signing a JWT:", err);
        return res.status(500);
    }
    ApplicationModel.addApplication({
        name: req.body.name,
        description: req.body.description,
        token,
        userId: req.user.id
    }).then(application => {
        res.json(new ApplicationDto(application));
    }).catch(err => {
        console.log(err);
        if (err instanceof BadRequestError) {
            res.status(400).json();
        } else {
            res.status(500).json();
        }
    });
});

module.exports = router;
