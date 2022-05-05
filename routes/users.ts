import Router from 'express';
import UserModel from "../model/UserModel";
import UsernameAlreadyExistError from "../errors/UsernameAlreadyExistError";
import EmailAlreadyExistError from "../errors/EmailAlreadyExistError";

const router = Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* Post users registration. */
router.post('/', function (req, res, next) {
    if(!req.body.username || !req.body.email || !req.body.password || req.body.username === '' || req.body.email === '' || req.body.password === '') {
        res.status(400).send('MISSING PARAMETERS');
    } else {
        UserModel.register(req.body.username, req.body.email, req.body.password).then(r => {
            res.send(r);
        }).catch(e => {
            if(e instanceof UsernameAlreadyExistError) {
                res.status(409).send("USER ALREADY EXISTS");
            } else if(e instanceof EmailAlreadyExistError) {
                res.status(409).send("EMAIL ALREADY EXISTS");
            } else res.status(500).send();
        })
    }
});

module.exports = router;
