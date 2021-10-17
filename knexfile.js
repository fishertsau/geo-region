// Update with your config settings.

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: __dirname + '/db/storage/dev.sqlite3.db',
    },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 10,
      idleTimeoutMillis: 360000 * 1000,
    },
    migrations: {
      directory: __dirname + '/db/migrations',
    },
    seeds: {
      directory: __dirname + '/db/seeds/test',
    },
  },
};
