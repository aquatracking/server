import Router from 'express';
const router = Router();

/* GET Hello World. */
router.get('/', function(req, res, next) {
    res.send('Hello World');
});

module.exports = router;
