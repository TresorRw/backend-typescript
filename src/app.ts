const express = require('express');
const session = require('express-session');
const passports = require('passport');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path')
const appRoutes = require('./routes/appRoutes');
const cp = require('cookie-parser');
const db = require('./config/db')
require('./config/auth');



db.authenticate()
    .then(() => {console.log('Connected to database')})
    .catch(err => console.log('Error in connection', err))
const app = express();
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}
// Middlewares
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: true}))
app.use(passports.initialize());
app.use(passports.session())
app.use(express.json());
app.use(express.static("public"));
app.use(cp());
app.use(appRoutes);

// Template engine
app.set("view engine", "ejs");

app.get('/', (req,res) => res.render("index"))
app.get('/auth/google', passports.authenticate('google', {scope: ['email', 'profile']}))
app.get('/auth/callback', passports.authenticate('google', {
    successRedirect: '/welcome',
    failureRedirect: '/auth/error'
}))


app.get('/signup', (req, res) => res.render("register"))
app.get('/profile', (req, res) => res.render("profile"))
app.get('/logout', (req, res) => {
    res.cookie("usrtk", "", {
        maxAge: 0
    });
    res.redirect('/');
})
const PORT: number = 3000;
app.listen(PORT | 3000, () => {console.log('Server started at: ' + PORT)})