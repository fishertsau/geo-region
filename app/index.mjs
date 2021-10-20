import koa from 'koa';
import db_check from './lib/db_check.mjs';
import local_db from '../db/local_db.mjs';
import ssh_check from './lib/ssh_check.mjs';
import anonymous_db from '../db/anonymous_db.mjs';
import sshConnection from './connections/ssh.mjs';
import health_check from './lib/health_check.mjs';
import { setupDbConn as setUpProdSlaveConn } from './connections/prodSlave.mjs';
import router from './controller/index.mjs'

const app = new koa();
app.sshClient = {};
app.prodSlaveDbConn = {};
app.anonymousDb = {};
app.localDb = {};

health_check(app);
ssh_check(app);
db_check(app);


router(app);

/** 建立 ssh 連線 **/
// todo: 把sshConnection改成lazy
sshConnection(app);

/** 註冊database連線 **/
local_db(app);
anonymous_db(app);

/**
 * todo:
 * - [x] api => 檢查ssh連線
 * - [x] api => 檢查mysql連線
 * - [ ] ssh斷線時通知 (用eventListener)
 * - [ ] sql斷線時通知 (用 eventListener)
 * - [ ] 動態新增ssh連線
 * - [ ] 動態新增mysql連線
 * - [ ] 列出所有ssh連線
 * - [ ] 列出所有mysql連線
 * - [ ] 送出sqlCmd時,需先檢查連線
 * - [ ] ssh連線失敗的處理: detect + retry
 */

setTimeout(() => {
  /** 建立 mysql 連線 (需要等ssh連線建立起來之後,再建立遠端sql連線) **/
  // todo: 改成lazy,或是用event通知 + listener處理
  setUpProdSlaveConn(app)(app.sshClient);
}, 1500);

// setTimeout(async () => {
//   /** 下sql語法 **/
//   const foo = await doSqlCmd(app.prodSlaveDbConn)(sqlCmd);
//
//   console.log(foo);
// }, 2500);

app.listen('9007');
