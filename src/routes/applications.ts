import Router from 'express';
import jwt from "jsonwebtoken";
import BadRequestError from "../errors/BadRequestError";
import ApplicationModel from "../model/ApplicationModel";
import ApplicationDto from "../dto/ApplicationDto";

const router = Router();

/* Post a new application. */
router.post('/', async function (req, res, next) {
    ApplicationModel.addApplication({
        name: req.body.name,
        description: req.body.description,
        token: jwt.sign({
            name: req.body.name,
            description: req.body.description,
            user: req.user
        }, process.env.APPLICATION_TOKEN_SECRET),
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
