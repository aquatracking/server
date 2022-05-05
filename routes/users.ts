import Router from 'express';
import UserModel from "../model/UserModel";
import UsernameAlreadyExistError from "../errors/UsernameAlreadyExistError";
import EmailAlreadyExistError from "../errors/EmailAlreadyExistError";
import WrongPasswordError from "../errors/WrongPasswordError";
import NotFoundError from "../errors/NotFoundError";

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

/* Post users login. */
router.post('/login', function (req, res, next) {
    if(!req.body.email || !req.body.password || req.body.email === '' || req.body.password === '') {
        res.status(400).send('MISSING PARAMETERS');
    } else {
        UserModel.login(req.body.email, req.body.password).then(r => {
            res.send(r);
        }).catch(e => {
            if(e instanceof WrongPasswordError) {
                res.status(401).send("WRONG PASSWORD");
            } else if (e instanceof NotFoundError) {
                res.status(404).send("USER NOT FOUND");
            } else res.status(500).send();
        });
    }
});

module.exports = router;
