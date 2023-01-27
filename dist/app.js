const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const path = require('path');
const appRoutes = require('./routes/appRoutes');
const cp = require('cookie-parser');
const db = require('./config/db');
db.authenticate()
    .then(() => { console.log('Connected to database'); })
    .catch(err => console.log('Error in connection', err));
const app = express();
// Middlewares
app.use(express.json());
app.use(express.static("public"));
app.use(cp());
app.use(appRoutes);
// Template engine
app.set("view engine", "ejs");
app.get('/', (req, res) => res.render("index"));
app.get('/signup', (req, res) => res.render("register"));
app.get('/profile', (req, res) => res.render("profile"));
app.get('/logout', (req, res) => {
    res.cookie("usrtk", "", {
        maxAge: 0
    });
    res.redirect('/');
});
const PORT = 5000;
app.listen(PORT | 5000, () => { console.log('Server started at: ' + PORT); });
