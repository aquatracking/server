import UserTokenUtil from "./utils/UserTokenUtil";

import express from "express";
import http from "http";
import * as dotenv from "dotenv";
import fs from "fs";
import cookieParser from "cookie-parser";
import * as jwt from "./jwt";

import Db from "./model/db";
import { UserDtoSchema } from "./dto/UserDto";
import UserModel from "./model/UserModel";
import ApplicationModel from "./model/ApplicationModel";
import { env, ensureValidEnv } from "./env";
import { tryPromise } from "./utils/tryPromise";
import { ApplicationTokenDtoSchema } from "./dto/ApplicationTokenDto";

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
app.all("*", async function (req, res, next) {
    if (req.path === "/users/login" || req.path === "/users") {
        next();
        return;
    }

    const { application_token } = req.headers;
    if (application_token && typeof application_token === "string") {
        const verifyApplicationToken = await tryPromise(
            jwt.verify(application_token, env.APPLICATION_TOKEN_SECRET)
        );
        if (!verifyApplicationToken.success) {
            return res.status(401).send({
                message: "Invalid application token",
            });
        }

        const application = await ApplicationModel.findOne({
            where: {
                token: req.headers.application_token,
            },
        });
        
        // decoded cannot be a string since the
        // token is generated from an object
        // TODO: validate decoded value
        const decodedApplicationTokenResult = ApplicationTokenDtoSchema.safeParse(verifyApplicationToken.result);
        if (!application || decodedApplicationTokenResult.success === false) {
            return res.status(401).send({
                message: "Invalid application token",
            });
        }
        const decoded = decodedApplicationTokenResult.data;

        req.user = decoded.user;
        return next();
    } else {
        const verifyAccessToken = await tryPromise(
            jwt.verify(
                req.cookies.access_token,
                env.ACCESS_TOKEN_SECRET
            )
        );
        const decodedAccessTokenResult = UserDtoSchema.safeParse(verifyAccessToken.result);
        if (verifyAccessToken.success && decodedAccessTokenResult.success) {
            req.user = decodedAccessTokenResult.data;
            return next();
        }

        const verifyRefreshToken = await tryPromise(
            jwt.verify(
                req.cookies.refresh_token,
                env.REFRESH_TOKEN_SECRET
            )
        );
        const decodedRefreshTokenResult = UserDtoSchema.safeParse(verifyRefreshToken.result);
        if (!verifyRefreshToken.success || !decodedRefreshTokenResult.success) {
            return res.status(401).send();
        }
        
        const decodedUser = decodedRefreshTokenResult.data; 
        const findUserResult = await tryPromise(
            UserModel.findByPk(decodedUser.id)
        );
        if (!findUserResult.success) {
            return res.status(401).send();
        }

        res.cookie(
            "access_token",
            UserTokenUtil.generateAccessToken(decodedUser),
            { maxAge: 1000 * 60 * 30 }
        );
        res.cookie("refresh_token", req.cookies.refresh_token, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });
        req.user = decodedUser;
        return next();
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
        : 'port ' + addr?.port;
    console.log('Listening on ' + bind);
}
