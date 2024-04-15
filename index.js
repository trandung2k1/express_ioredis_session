const { Redis } = require('ioredis');
const colors = require('colors');
const express = require('express');
const RedisStore = require('connect-redis').default;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const authenticate = require('./auth.middleware');
const redis = new Redis();
const redisStore = new RedisStore({
    client: redis,
    prefix: 'app:',
});
const sessionMiddleware = session({
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    secret: 'session-secret',
    name: 'sessionId',
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 30,
        sameSite: 'strict',
        path: '/',
    },
});
redis.on('error', (err) => {
    console.log(err);
    console.log(colors.red('Redis Client Error'));
    process.exit(1);
});
redis.on('connect', () => {
    console.log(colors.green('Redis plugged in.'));
});
const errorHandler = (error, req, res, next) => {
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    if (error.statusCode) {
        res.status(error?.statusCode);
    } else {
        res.status(statusCode);
    }
    return res.json({
        status: error?.statusCode,
        message: error?.message,
    });
};

// redis.del('name');

const app = express();
app.set('view engine', 'ejs');
const port = 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionMiddleware);

app.get('/', (req, res) => {
    if (req?.session?.user) {
        return res.render('dashboard');
    } else {
        return res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    console.log(req?.session?.user);
    if (req?.session?.user) {
        return res.redirect('/');
    } else {
        return res.render('login');
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password is required',
        });
    }
    const user = {
        email: email,
    };
    req.session.user = user;
    return res.redirect('/');
    // return res.status(200).json(user);
});

app.post('/logout', (req, res) => {
    res.clearCookie('sessionId');
    req.session.user = null;
    req.session.destroy(function (err) {
        // cannot access session here
    });
    return res.redirect('/login');
    // return res.status(200).json({
    //     message: 'Log out successfully',
    // });
});

app.get('/profile', authenticate, (req, res) => {
    console.log(req?.cookies?.sessionId);
    return res.status(200).json(req.session.user);
});
app.use(errorHandler);
app.listen(port, () => {
    console.log(colors.green(`Server listening on http://localhost:${port}`));
});
