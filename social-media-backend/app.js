const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const PassportLocal = require('passport-local');
const path = require('path')
const methodOverride = require('method-override');



const app = express();

//Connect Mongo
mongoose.connect('mongodb://localhost:27017/socialMediaBackend', {useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false})
    .then(() => {
        console.log('Database Connected');
    })
    .catch(() => {
        console.log('Error Connecting to Database, exiting...');
        process.exit();
    })


app.set('view engine', 'ejs');

//Running the server from every folder
app.set('views', path.join(__dirname, 'views'));

const postRoutes = require('./routes/posts');
const userRoutes  = require('./routes/user');
const user = require('./models/user');


app.use(express.urlencoded({extended: true}));

//Using Method Override to create Patch requests with forms
app.use(methodOverride('_method'));

//Session
const sessionConfig = {
    secret: 'SECRET!!!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

//Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new PassportLocal(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());



//ROUTES
//Post routes
app.use('/posts', postRoutes)
//User routes
app.use('/user', userRoutes)


app.listen(3000, () => {
    console.log('Listening on Port 3000')
})
