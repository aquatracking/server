import UserTokenUtil from "./utils/UserTokenUtil";

import express from 'express';
import http from 'http';
import * as dotenv from 'dotenv';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import * as jwt from './jwt';

import Db from './model/db';
import UserDto from "./dto/UserDto";
import UserModel from "./model/UserModel";
import ApplicationModel from "./model/ApplicationModel";
import { env, ensureValidEnv } from "./env";

// - - - - - Environment variables - - - - - //
if (fs.existsSync('.env')) {
    console.log('Using .env file to supply config environment variables');
    dotenv.config();
} else {
    console.log('.env file not found, creating one with default values');

    fs.copyFileSync(".env.example", ".env")

    console.log('Please complete the .env file')

    process.exit(1);
}

ensureValidEnv();

// - - - - - Serveur Express - - - - - //
console.log('Starting server...');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb' ,extended: false}));
app.use(cookieParser());
app.set('trust proxy', 1);

const port = env.PORT;
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// - - - - - Routes - - - - - //
app.all('*', function (req, res, next) {
    if (req.path === '/users/login' || req.path === '/users') {
        next();
    } else {
        const { application_token} = req.headers;
        if(application_token && typeof application_token === "string") {
            jwt.verify(application_token, env.APPLICATION_TOKEN_SECRET)
                .catch((err) => {
                    console.log(err);
                    res.status(401).send({
                        message: "Invalid application token",
                    });
                })
                .then((decoded) => {
                    ApplicationModel.findOne({
                        where: {
                            token: req.headers.application_token,
                        },
                    })
                        .then((application) => {
                            // decoded cannot be a string since the
                            // token is generated from an object
                            if (application && typeof decoded !== "string") {
                                req.user = new UserDto(decoded.user);
                                next();
                            } else {
                                res.status(401).send({
                                    message: "Invalid application token",
                                });
                            }
                        })
                        .catch((err) => {
                            res.status(500).send({
                                message: "Internal server error",
                            });
                        });
                });
        } else {
            jwt.verify(req.cookies.access_token, env.ACCESS_TOKEN_SECRET)
                .catch((err) => {
                    jwt.verify(req.cookies.refresh_token, env.REFRESH_TOKEN_SECRET)
                        .catch((err) => res.status(401).send())
                        .then((user) => {
                            UserModel.findByPk(user.id)
                                .then(async function (user) {
                                    if (user) {
                                        res.cookie('access_token', await UserTokenUtil.generateAccessToken(new UserDto(user)), {maxAge: 1000 * 60 * 30});
                                        res.cookie('refresh_token', req.cookies.refresh_token, {maxAge: 1000 * 60 * 60 * 24 * 30});
                                        req.user = new UserDto(user);
                                        next();
                                    } else {
                                        res.status(401).send();
                                    }
                                })
                                .catch(function (err) {
                                    res.status(401).send();
                                });
                        });

                })
                .then(decoded => {
                    req.user = new UserDto(decoded);
                    next();
                })
        }
    }
});
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/aquariums', require('./routes/aquariums'));
app.use('/applications', require('./routes/applications'));

// - - - - - Database - - - - - //
console.log('Connecting to database...');
Db.init().catch(err => {
    console.error(err);
    process.exit(1);
}).then(async () => {
    console.log('Database connected.');
});

// - - - - - Functions - - - - - //

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: NodeJS.ErrnoException) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}
