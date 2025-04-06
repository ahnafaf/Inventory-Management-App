// Database connection setup
const knex = require('knex');
const config = require('../../knexfile');

// Create the database connection
const db = knex(config);

module.exports = db;