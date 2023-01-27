const Sequelize_ = require('sequelize');
const db_ = require('../config/db');
const Address = db_.define('user_address', {
    email: {
        type: Sequelize_.STRING
    },
    province: {
        type: Sequelize_.STRING
    },
    district: {
        type: Sequelize_.STRING
    },
    sector: {
        type: Sequelize_.STRING
    },
    cell: {
        type: Sequelize_.STRING
    },
    street: {
        type: Sequelize_.STRING
    }
})

module.exports = Address;