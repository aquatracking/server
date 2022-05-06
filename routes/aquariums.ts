import Router from 'express';
import AquariumModel from "../model/AquariumModel";
import AquariumDto from "../dto/AquariumDto";
import BadRequestError from "../errors/BadRequestError";

const router = Router();

/* GET aquariums listing. */
router.get('/', function (req, res, next) {
    AquariumModel.getAllOfUser(req.user).then(aquariums => {
        res.json(aquariums.map(aquarium => new AquariumDto(aquarium)));
    }).catch(err => {
        console.error(err);
        res.status(500).json();
    });
});

/* Post a new aquarium. */
router.post('/', function (req, res, next) {
    if (!req.body.name || req.body.name === "" || !req.body.size) {
        res.status(400).json();
    } else {
        AquariumModel.createOne({
            user: req.user,
            name: req.body.name,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
            salt: req.body.salt,
            size: req.body.size,
        }).then(aquarium => {
            res.json(new AquariumDto(aquarium));
        }).catch(err => {
            if (err instanceof BadRequestError) {
                res.status(400).json();
            } else {
                res.status(500).json();
            }
        });
    }
});

module.exports = router;
