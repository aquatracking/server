import UserTokenUtil from "./utils/UserTokenUtil";

import express from 'express';
import http from 'http';
import * as dotenv from 'dotenv';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import Db from './model/db';
import UserDto from "./dto/UserDto";
import UserModel from "./model/UserModel";
import ApplicationModel from "./model/ApplicationModel";

// - - - - - Environment variables - - - - - //
if (fs.existsSync('.env')) {
    console.log('Using .env file to supply config environment variables');
    dotenv.config();
} else {
    console.log('.env file not found, creating one with default values');

    fs.writeFileSync('.env', `
        PORT=3000
        MARIADB_HOST=localhost
        MARIADB_PORT=3306
        MARIADB_USER=root
        MARIADB_PASSWORD=example
        MARIADB_DATABASE=aquatracking
        ACCESS_TOKEN_SECRET=
        REFRESH_TOKEN_SECRET=
        APPLICATION_TOKEN_SECRET=
        MAIL_HOST=localhost
        MAIL_PORT=25
        MAIL_USER=mail@exemple.fr
        MAIL_PASS=password
        MAIL_SSL=false
        REGISTRATION_ENABLED=false
    `.replaceAll('    ', ''));

    console.log('Please complete .env file')

    process.exit(1);
}

let envNotCompleted = false;
if (process.env.MARIADB_HOST === undefined || process.env.MARIADB_HOST === '') {
    console.error('Environment variable MARIADB_HOST is not defined.');
    envNotCompleted = true;
}
if (process.env.MARIADB_PORT === undefined || process.env.MARIADB_PORT === '') {
    console.error('Environment variable MARIADB_PORT is not defined.');
    envNotCompleted = true;
}
if (process.env.MARIADB_USER === undefined || process.env.MARIADB_USER === '') {
    console.error('Environment variable MARIADB_USER is not defined.');
    envNotCompleted = true;
}
if (process.env.MARIADB_PASSWORD === undefined || process.env.MARIADB_PASSWORD === '') {
    console.error('Environment variable MARIADB_PASSWORD is not defined.');
    envNotCompleted = true;
}
if (process.env.MARIADB_DATABASE === undefined || process.env.MARIADB_DATABASE === '') {
    console.error('Environment variable MARIADB_DATABASE is not defined.');
    envNotCompleted = true;
}
if (process.env.ACCESS_TOKEN_SECRET === undefined || process.env.ACCESS_TOKEN_SECRET === '') {
    console.error('Environment variable ACCESS_TOKEN_SECRET is not defined.');
    envNotCompleted = true;
}
if (process.env.REFRESH_TOKEN_SECRET === undefined || process.env.REFRESH_TOKEN_SECRET === '') {
    console.error('Environment variable REFRESH_TOKEN_SECRET is not defined.');
    envNotCompleted = true;
}
if (process.env.APPLICATION_TOKEN_SECRET === undefined || process.env.APPLICATION_TOKEN_SECRET === '') {
    console.error('Environment variable APPLICATION_TOKEN_SECRET is not defined.');
    envNotCompleted = true;
}
if (process.env.MAIL_HOST === undefined || process.env.MAIL_HOST === '') {
    console.error('Environment variable MAIL_HOST is not defined.');
    envNotCompleted = true;
}
if (process.env.MAIL_PORT === undefined || process.env.MAIL_PORT === '') {
    console.error('Environment variable MAIL_PORT is not defined.');
    envNotCompleted = true;
}
if (process.env.MAIL_USER === undefined || process.env.MAIL_USER === '') {
    console.error('Environment variable MAIL_USER is not defined.');
    envNotCompleted = true;
}
if (process.env.MAIL_PASS === undefined || process.env.MAIL_PASS === '') {
    console.error('Environment variable MAIL_PASS is not defined.');
    envNotCompleted = true;
}
if (process.env.REGISTRATION_ENABLED === undefined || process.env.REGISTRATION_ENABLED === '') {
    console.error('Environment variable REGISTRATION_ENABLED is not defined.');
    envNotCompleted = true;
}

if(envNotCompleted) process.exit(1);

// - - - - - Serveur Express - - - - - //
console.log('Starting server...');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb' ,extended: false}));
app.use(cookieParser());
app.set('trust proxy', 1);

const port = normalizePort(process.env.PORT || '3000');
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
            jwt.verify(application_token, process.env.APPLICATION_TOKEN_SECRET, function (err, decoded) {
                if(err) {
                    console.log(err);
                    res.status(401).send({
                        message: 'Invalid application token'
                    });
                } else {
                    ApplicationModel.findOne({
                        where: {
                            token: req.headers.application_token
                        }
                    }).then(application => {
                        // decoded cannot be a string since the
                        // token is generated from an object
                        if(application && typeof decoded !== "string") {
                            req.user = new UserDto(decoded.user);
                            next();
                        } else {
                            res.status(401).send({
                                message: 'Invalid application token'
                            });
                        }
                    }).catch(err => {
                        res.status(500).send({
                            message: 'Internal server error'
                        });
                    })
                }
            });
        } else {
            jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    jwt.verify(req.cookies.refresh_token, process.env.REFRESH_TOKEN_SECRET, function (err, user) {
                        if (err) {
                            res.status(401).send();
                        } else {
                            UserModel.findByPk(user.id).then(function (user) {
                                if (user) {
                                    res.cookie('access_token', UserTokenUtil.generateAccessToken(new UserDto(user)), {maxAge: 1000 * 60 * 30});
                                    res.cookie('refresh_token', req.cookies.refresh_token, {maxAge: 1000 * 60 * 60 * 24 * 30});
                                    req.user = new UserDto(user);
                                    next();
                                } else {
                                    res.status(401).send();
                                }
                            }).catch(function (err) {
                                res.status(401).send();
                            })
                        }
                    });
                } else {
                    req.user = new UserDto(decoded);
                    next();
                }
            });
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
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

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
