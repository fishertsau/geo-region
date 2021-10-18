import mysql from 'mysql2';
import config from 'config';
import R from 'ramda';

const dbConfig = R.path(['database', 'prodSlave'])(config);

export const setupDbConn = (app) => (sshClient) => {
  // 在 ssh tunnel中,建立一個 mysql.db連線
  // mysql server看到的client-ip是ssh server的ip
  // 建立一個 src -> dst connection
  sshClient.forwardOut(
    // src
    '127.0.0.1', // host
    3306,  // port

    // dst
    dbConfig.host, // host
    3306, //port

    // 建立DB連線
    async (err, stream) => {
      // todo: 寫event logs
      app.prodSlaveDbConn = await mysql.createConnection({
        ...dbConfig,
        stream,
      });
    },
  );
};
