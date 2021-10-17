import knex from 'knex';
import dBConfig from '../knexfile.js';
const environment = process.env.NODE_ENV || 'development';

export default (app) => {
  app.localDb = knex(dBConfig[environment]);
}