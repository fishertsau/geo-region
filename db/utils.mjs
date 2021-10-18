import { sleep } from '../app/lib/utils.mjs';

// todo: 把這個動作放在一個wrapper:專門等待(需要等+回傳結果在callback裡面)的功能
export const doSqlCmd = (givenDbConn) => async (sqlCmd) => {
  let result = undefined;
  let returned = false;

  givenDbConn.query(sqlCmd, function (err, results) {
    if (err) {
      console.log('error in doSqlCmd:', err);
    }
    result = results;
    returned = true;
  });

  // 等到回傳完成
  do {
    await sleep(100);
  } while (!returned);

  return result;
};

export const selectAllCmd = (db) => (databaseName) => (tableName) => {
  return db
    .select('*')
    .from(`${databaseName}.${tableName}`)
    .toString();
};