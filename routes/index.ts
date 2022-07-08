import Router from 'express';
import MeasurementTypeModel from "../model/MeasurementTypeModel";
const router = Router();

/* GET Hello World. */
router.get('/', function(req, res, next) {
    res.send('Hello World');
});

/* get measurement types listing. */
router.get('/measurements/types', function(req, res) {
    res.json(MeasurementTypeModel.getAll())
})

module.exports = router;
