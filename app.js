const { join } = require('path');
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo(expressSession);
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const User = require('./models/user');

const app = express();

// Setup view engine
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 15 * 24 * 60 * 60 * 1000 //15 days (days, hours, minutes, seconds, millisec)
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60
    })
  })
);

//Deserialisizing the user

const userDeserialisationMiddleware = (req, res, next) => {
  //...if there is a userId in the session...
  //(this means that the user is authenticated,
  //because the session is only then given the
  //property 'userId' with the value of the actual
  //user's id)
  if (req.session.userId) {
    //...it loads the user object,...
    User.findById(req.session.userId)
      .then((user) => {
        //...it saves it to the request...
        //which means: its adding a property 'user'
        //to the req object:
        //(so its directly accessible and not only via
        //req.body.username or req.session.username)
        req.user = user;
        //every view has access to the user object
        // if there is  user authenticated
        res.locals.user = user;
        //...and it passes the request onwards...
        next();
      })
      .catch((error) => {
        next(error);
      });
  } else {
    //...otherwise it moves on
    next();
  }
};
//this middleware sees...
app.use(userDeserialisationMiddleware);

app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));

app.use(express.urlencoded({ extended: false }));
app.use(
  sassMiddleware({
    src: join(__dirname, 'public'),
    dest: join(__dirname, 'public'),
    outputStyle:
      process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
    force: process.env.NODE_ENV === 'development',
    sourceMap: true
  })
);
app.use(express.static(join(__dirname, 'public')));
app.use(logger('dev'));

app.use('/', indexRouter);
app.use('/user', userRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;
