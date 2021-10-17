import mysql from 'mysql2';

// todo: move config to a central place
export const setupDbConn = (app) => (sshClient) => {
  // 在 ssh tunnel中,建立一個 mysql.db連線
  // mysql server看到的client-ip是ssh server的ip
  // 建立一個 src -> dst connection
  sshClient.forwardOut(
    // src
    '127.0.0.1', // host
    3306,  // port
    // dst
    'prod-slave', // host
    3306, //port

    // callback
    async (err, stream) => {
      // 建立DB連線
      // todo: 寫event logs
      app.prodSlaveDbConn = await mysql.createConnection({
        host: 'prod-slave',
        port: 3306,
        database: 'pineapple',
        user: 'prod_rd5',
        password: 'lazYbIrd@min17raft',
        stream,
      });
    },
  );
};

