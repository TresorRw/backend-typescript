const Sequelizes = require('sequelize');
const dbc = require('../config/db');
const User = dbc.define('user', {
    email: {
        type: Sequelizes.STRING
    }, 
    user_pwd: {
        type: Sequelizes.STRING
    }
})

module.exports = User;