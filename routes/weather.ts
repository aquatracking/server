import {Router} from "express";
import WeatherModel from "../model/WeatherModel";
import WeatherDto from "../dto/WeatherDto";
import {Op} from "sequelize";

const router = Router();

/* Get Weather list of city */
router.get('/:city', async function (req, res, next) {
    if(!req.params.city) {
        res.status(400).json();
        return;
    }

    const weather = await WeatherModel.findAll({
        where: {
            city: req.params.city,
            measuredAt: {
                [Op.between]: [req.query.from ? new Date(req.query.from) : new Date((new Date()).getTime() - 24 * 60 * 60 * 1000), req.query.to ? new Date(req.query.to) : new Date()]
            }
        },
        order: [
            ['measuredAt', 'DESC']
        ]
    })

    return res.json(weather.map(weatherModel => {
        return new WeatherDto(weatherModel);
    }));
})

/* Get last weather of city */
router.get('/:city/last', async function (req, res, next) {
    if(!req.params.city) {
        res.status(400).json();
        return;
    }

    const weather = await WeatherModel.findOne({
        where: {
            city: req.params.city
        },
        order: [
            ['measuredAt', 'DESC']
        ]
    })

    return res.json(new WeatherDto(weather));
})

module.exports = router;