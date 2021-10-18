import Router from 'koa-router';
import bodyParser from 'koa-body';
import R, { fromPairs, map, pipe } from 'ramda';
import { doSqlCmd, selectAllCmd } from '../../db/utils.mjs';
import { prettifyFile, writeToFile } from '../lib/utils.mjs';
import fs from 'fs';

const router = new Router({ prefix: '/api' });

const getNamePair = (langName) => (r) => {
  const value = !!R.prop(langName)(r) ? R.prop(langName)(r) : R.prop('en_name')(r);
  return [`COMMON_CITY_ID_${r.id}`, value];
};

const getEnName = getNamePair('en_name');
const getZhTwName = getNamePair('zh_tw_name');
const getCnName = getNamePair('zh_cn_name');

const getEnZhTwPair = (r) => [r.en_name, r.zh_tw_name];
const getEnZhCnPair = (r) => [r.en_name, r.zh_cn_name];

const byRegion = (a, b) => (a.region > b.region) ? 1 : -1;
const byEnName = (a, b) => (a.en_name > b.en_name) ? 1 : -1;
const byId = (a, b) => (a.id > b.id) ? 1 : -1;
const hasEn = (region) => R.prop('en_name')(region) !== '';
const hasZhTw = (region) => R.prop('zh_tw_name')(region) !== '';

const jsonLangs = ['en', 'zh-tw', 'zh-cn'];
const jsLangs = ['zh-tw', 'zh-cn'];

const prependExport = (content) => ('module.exports=' + content);

const registerRoutes = (app) => {
  router.get('/remoteDb/sqlcmd', async (ctx) => {
    const { sqlcmd } = ctx.request.body;

    /** 下sql語法 **/
    await doSqlCmd(app.prodSlaveDbConn)(sqlcmd)
      .then(async (result) => {
        console.log(result);
        return true;
      })
      .then(() =>
        ctx.body = {
          result: 'ok',
          msg: 'sqlcmd executed successfully!',
        },
      );
  });

  router.get('/migrate/:tableName', async (ctx) => {
    const { tableName } = ctx.params;

    // delete all data in table
    await app.localDb(tableName).del();

    // migrate data from remote database
    const sqlCmd = selectAllCmd(app.anonymousDb)('pineapple_hoster')(tableName);

    /** 下sql語法 **/
    await doSqlCmd(app.prodSlaveDbConn)(sqlCmd)
      .then(async (result) => {
        console.log(result);
        for(let i = 0; i < result.length; i++) {
          await app.localDb(tableName).insert({ ...result[i] });
        }

        return true;
      })
      .then(() =>
        ctx.body = {
          result: 'ok',
          msg: 'migration completed',
          table: tableName,
        },
      );
  });

  router.post('/generate/geoip_region/json', async (ctx) => {
    // get data from local database
    const regions = await app.localDb('geoip_region').select();

    // clear delete file
    for(let i = 0; i < jsonLangs.length; i++) {
      const filePath = `output/${jsonLangs[i]}/region.json`;
      if (fs.existsSync(filePath)) {
        await fs.unlinkSync(filePath);
      }
    }

    // generate json file
    const cleanData = pipe(R.filter(hasEn), R.sort(byId))(regions);

    // todo: 重構一下
    let result = pipe(map(getEnName), fromPairs, JSON.stringify)(cleanData);
    await writeToFile('output/en/region.json', result)
      .then(() => prettifyFile('output/en/region.json'));

    result = pipe(map(getZhTwName), fromPairs, JSON.stringify)(cleanData);
    await writeToFile('output/zh-tw/region.json', result)
      .then(() => prettifyFile('output/zh-tw/region.json'));

    result = pipe(map(getCnName), fromPairs, JSON.stringify)(cleanData);
    await writeToFile('output/zh-cn/region.json', result)
      .then(() => prettifyFile('output/zh-cn/region.json'));

    ctx.body = {
      result: 'ok',
      msg: 'file generated',
    };
  });

  router.post('/generate/geoip_region/js', async (ctx) => {
    // get data from local database
    const regions = await app.localDb('geoip_region').select();

    // clear delete file
    for(let i = 0; i < jsLangs.length; i++) {
      const filePath = `output/${jsLangs[i]}/region.js`;
      if (fs.existsSync(filePath)) {
        await fs.unlinkSync(filePath);
      }
    }

    // generate js file
    const cleanData = pipe(R.filter(hasEn), R.filter(hasZhTw), R.sort(byEnName))(regions);

    const customTransform = (tempFilename, destFilename) => () => {
      const fileContent = fs.readFileSync(tempFilename, 'utf-8');
      const result2 = fileContent.replace(/(\b[ō\w]+\b)(?=:)/g, '"$1"');

      writeToFile(destFilename, result2);

      if (fs.existsSync(tempFilename)) {
        fs.unlinkSync(tempFilename);
      }
    };

    let result = pipe(map(getEnZhTwPair), fromPairs, JSON.stringify, prependExport)(cleanData);
    await writeToFile('output/zh-tw/region_temp.js', result)
      .then(() => prettifyFile('output/zh-tw/region_temp.js',
        customTransform('output/zh-tw/region_temp.js', 'output/zh-tw/region.js')));

    result = pipe(map(getEnZhCnPair), fromPairs, JSON.stringify, prependExport)(cleanData);
    await writeToFile('output/zh-cn/region_temp.js', result)
      .then(() => prettifyFile('output/zh-cn/region_temp.js',
        customTransform('output/zh-cn/region_temp.js', 'output/zh-cn/region.js')));

    ctx.body = {
      result: 'ok',
      msg: 'js file generated',
    };
  });
};

export default (app) => {
  app.use(bodyParser({
    parsedMethods: ['POST', 'PUT', 'GET', 'DELETE'],
    multipart: true,
  }));

  registerRoutes(app);

  app.use(router.routes())
    .use(router.allowedMethods());

  app.use(async (ctx) => {
    ctx.status = 404;

    ctx.body = {
      result: 'error',
      msg: `No route found for ${ctx.method} ${ctx.originalUrl}` || ctx.url,
    };
  });
};