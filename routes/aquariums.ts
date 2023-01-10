import Router from 'express'
import AquariumModel from "../model/AquariumModel"
import AquariumDto from "../dto/AquariumDto"
import BadRequestError from "../errors/BadRequestError"
import MeasurementTypeModel from "../model/MeasurementTypeModel"
import MeasurementDto from "../dto/MeasurementDto";
import MeasurementSettingDto from "../dto/MeasurementSettingDto";
import MeasurementSettingModel from "../model/MeasurementSettingModel";

const router = Router()

/** GET aquariums listing. */
router.get('/', function (req, res) {
    AquariumModel.getAllOfUser(req.user).then(aquariums => {
        res.json(aquariums.map(aquarium => new AquariumDto(aquarium)))
    }).catch(err => {
        console.error(err)
        res.status(500).json()
    })
})

/** GET aquarium image. */
router.get('/:id/image', async function (req, res) {
    if(!req.params.id) {
        res.status(400).json()
        return
    }

    let image = await AquariumModel.getImageForOneAquariumOfUser(req.params.id, req.user).catch(() => {
        res.status(404).json()
        return
    })

    res.send(image)
})

/** Post a new aquarium. */
router.post('/', async function (req, res) {
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
        res.json(new AquariumDto(aquarium))
    }).catch(err => {
        console.log(err)
        if (err instanceof BadRequestError) {
            res.status(400).json()
        } else {
            res.status(500).json()
        }
    })
})

/** PATCH an aquarium. */
router.patch('/:id', async function (req, res) {
    if(!req.params.id) {
        res.status(400).json()
        return
    }

    let aquarium = await AquariumModel.getOneOfUser(req.params.id, req.user)
    if(!aquarium) {
        res.status(404).json()
        return
    }

    aquarium.updateOne({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
    }).then(() => {
        res.json()
    }).catch(err => {
        console.log(err)
        if (err instanceof BadRequestError) {
            res.status(400).json()
        } else {
            res.status(500).json()
        }
    })
})

/** @deprecated
 *  Add temperature measurement of aquarium */
router.post('/:id/temperature', async function (req, res) {
    if(!req.body.temperature || !req.params.id) {
        res.status(400).json()
        return
    }

    // Get type
    const type = MeasurementTypeModel.getByCode('TEMPERATURE')

    // Get aquarium
    const aquarium = await AquariumModel.getOneOfUser(req.params.id, req.user)
    if(!aquarium) return res.status(404).json()

    // Get value
    const value = req.body.temperature

    // Add measurement
    aquarium.addMeasurement(type, value, new Date()).then(() => {
        console.log(`Deprecated add of temperature of aquarium ${aquarium.id} : ${value}`)
        res.json()
    }).catch(err => {
        console.log(err)
        res.status(500).json()
    })
})

/** Get aquarium's measurement */
router.get('/:id/measurements/:type', async function (req, res) {
    if(!req.params.id || !req.params.type) {
        res.status(400).json()
        return
    }

    // Get type
    const type = MeasurementTypeModel.getByCode(req.params.type)
    if(!type) return res.status(404).json()

    // Get aquarium
    const aquarium = await AquariumModel.getOneOfUser(req.params.id, req.user)
    if(!aquarium) return res.status(404).json()

    // Get from and to dates
    const fromDate = req.query.from ? new Date(req.query.from) : undefined
    const toDate = req.query.to ? new Date(req.query.to) : undefined

    // Get measurements
    try {
        const measurements = await aquarium.getMeasurements(type, fromDate, toDate)
        return res.json(measurements.map(measurement => new MeasurementDto(measurement)))
    } catch(err) {
        console.log(err)
        return res.status(500).json()
    }

})

/** Get last aquarium's measurement */
router.get('/:id/measurements/:type/last', async function (req, res) {
    if(!req.params.id || !req.params.type) {
        res.status(400).json()
        return
    }

    // Get type
    const type = MeasurementTypeModel.getByCode(req.params.type)
    if(!type) return res.status(404).json()

    // Get aquarium
    const aquarium = await AquariumModel.getOneOfUser(req.params.id, req.user)
    if(!aquarium) return res.status(404).json()

    // Get last measurement
    try {
        const measurement = await aquarium.getLastMeasurement(type)
        return res.json((measurement != null) ? new MeasurementDto(measurement) : null)
    } catch(err) {
        console.log(err)
        return res.status(500).json()
    }
})

/** Set aquarium's measurement */
router.post('/:id/measurements/:type', async function (req, res) {
    if(!req.body.value || !req.params.id || !req.params.type) {
        res.status(400).json()
        return
    }

    // Get type
    const type = MeasurementTypeModel.getByCode(req.params.type)
    if(!type) return res.status(404).json()

    // Get aquarium
    const aquarium = await AquariumModel.getOneOfUser(req.params.id, req.user)
    if(!aquarium) return res.status(404).json()

    // Get value
    const value = req.body.value

    // Get measuredAt
    const measuredAt = (req.body.measuredAt) ? new Date(req.body.measuredAt) : new Date()

    // Add measurement
    aquarium.addMeasurement(type, value, measuredAt).then(() => {
        console.log(`${type.name} of aquarium ${aquarium.id} added : ${value}`)
        res.json()
    }).catch(err => {
        console.log(err)
        res.status(500).json()
    })
})

/** Get aquarium's measurements settings */
router.get('/:id/measurements', async function (req, res) {
    if(!req.params.id) {
        res.status(400).json()
        return
    }

    // Get aquarium
    const aquarium = await AquariumModel.getOneOfUser(req.params.id, req.user)
    if(!aquarium) return res.status(404).json()

    // Get settings
    const settings = await aquarium.getMeasurementsSettings()
    return res.json(settings.map(setting => new MeasurementSettingDto(setting)))
})

/** Set aquarium's measurements settings */
router.patch('/:id/measurements', async function (req, res) {
    if(!req.params.id || !req.body.settings || !Array.isArray(req.body.settings) || req.body.settings.length === 0) {
        res.status(400).json()
        return
    }

    // Get aquarium
    const aquarium = await AquariumModel.getOneOfUser(req.params.id, req.user)
    if(!aquarium) return res.status(404).json()

    // Get settings
    let settings = req.body.settings
    if(!settings) return res.status(400).json()

    try {
        settings = settings.map(setting => MeasurementSettingModel.fromDto(setting))
    } catch (err) {
        console.log(err)
        return res.status(400).json()
    }

    // Set settings
    aquarium.setMeasurementsSettings(settings).then(() => {
        res.json()
    }).catch(err => {
        console.log(err)
        res.status(500).json()
    })
})

/** Archive aquarium */
router.put('/:id/archive', async function (req, res) {
    if(!req.params.id) {
        res.status(400).json()
        return
    }

    let aquarium = await AquariumModel.getOneOfUser(req.params.id, req.user)
    if(!aquarium) return res.status(404).json()

    aquarium.archiveOne().then(() => {
        res.json()
    }).catch(err => {
        console.log(err)
        res.status(500).json()
    })
})

/** Unarchive aquarium */
router.put('/:id/unarchive', async function (req, res) {
    if(!req.params.id) {
        res.status(400).json()
        return
    }

    let aquarium = await AquariumModel.getOneOfUser(req.params.id, req.user)
    if(!aquarium) return res.status(404).json()

    aquarium.unarchiveOne().then(() => {
        res.json()
    }).catch(err => {
        console.log(err)
        res.status(500).json()
    })
})

module.exports = router
