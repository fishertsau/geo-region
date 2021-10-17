import knex from 'knex';

export default (app) => {
  app.anonymousDb = knex({ client: 'mysql2', connection: {} });
}
