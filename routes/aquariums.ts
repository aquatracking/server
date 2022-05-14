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
router.post('/', async function (req, res, next) {
    AquariumModel.createOne({
        user: req.user,
        name: req.body.name,
        description: req.body.description,
        startedDate: req.body.startedDate,
        volume: req.body.volume,
        imageUrl: req.body.imageUrl,
        image: req.body.image,
        salt: req.body.salt,
    }).then(aquarium => {
        res.json(new AquariumDto(aquarium));
    }).catch(err => {
        console.log(err);
        if (err instanceof BadRequestError) {
            res.status(400).json();
        } else {
            res.status(500).json();
        }
    });
});

/* Add temperature measurement of aquarium */
router.post('/:id/temperature', async function (req, res, next) {
    if(!req.body.temperature || !req.params.id) {
        res.status(400).json();
        return;
    }

    const aquarium = await AquariumModel.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!aquarium) {
        res.status(404).json();
    } else {
        aquarium.addTemperature(req.body.temperature).then(() => {
            console.log(`Temperature of aquarium ${aquarium.id} added : ${req.body.temperature}`);
            res.json();
        }).catch(err => {
            console.log(err);
            res.status(500).json();
        });
    }
});

module.exports = router;
