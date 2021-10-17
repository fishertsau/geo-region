import R from 'ramda';
import { doSqlCmd } from '../../db/utils.mjs';

const databaseCheck = (givenApp) => async (ctx, next) => {
  if (ctx.path === '/database') {
    await
      doSqlCmd(givenApp.prodSlaveDbConn)('show schemas;')
        .then((result) => {
          // 是否有schema:"mysql"
          return !!(R.find(R.propEq('Database', 'mysql'))(result));
        })
        .then((result) => {
          ctx.body = {
            result: 'ok',
            msg: !result ? 'no database connection' : 'database health',
          };
        });

    return;
  }

  await next();
};

export default (app) => {
  app.use(databaseCheck(app));
};