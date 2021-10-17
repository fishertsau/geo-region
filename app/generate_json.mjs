import fs from 'fs';
import R, { split, map, pipe, fromPairs } from 'ramda';
import { addExport, clearQuote, lineToArr, prettyFile, removeFileByPath, writeToFile } from './lib/utils.mjs';

/**
 * index
 */
const sourceIndexMapping = {
  'id': 0,
  'country_id': 1,
  'country': 2,
  'region': 3,
  'en_name': 4,
  'zh_tw_name': 5,
  'zh_cn_name': 6,
};

const sI = sourceIndexMapping;

// 輸出檔案位置 json
const jsFilePaths = [
  'output/zh-tw/region.js',
  'output/zh-cn/region.js',
];

// 輸出檔案位置 json
const jsonFilePaths = [
  'output/en/region.json',
  'output/zh-tw/region.json',
  'output/zh-cn/region.json',
];

/**
 * 讀取原始檔
 */
const fileContent = fs.readFileSync('geoip_region.csv', 'utf-8');
const regionSource = pipe(clearQuote, lineToArr, map(split(',')))(fileContent);

/**
 * 產生json檔案
 * **/
const generateJson = () => {
  const genPair = targetIndex => (l) => [`COMMON_REGION_ID_${l[sI.id]}`, l[targetIndex]];

  const jsonResults = {
    'en': pipe(map(genPair(sI.en_name)), fromPairs, JSON.stringify)(regionSource),
    'zh-tw': pipe(map(genPair(sI.zh_tw_name)), fromPairs, JSON.stringify)(regionSource),
    'zh-cn': pipe(map(genPair(sI.zh_cn_name)), fromPairs, JSON.stringify)(regionSource),
  };

  jsonFilePaths.map((filePath, index) => {
    const contentKey = split('/')(filePath)[1];

    removeFileByPath(filePath)
      .then(() => writeToFile(filePath, jsonResults[contentKey]))
      .then(() => prettyFile(filePath));
  });
};

/**
 * 產生js檔案
 */
const generateJs = () => {
  const hasEnName = (region) => region[sI.en_name] !== '' && region[sI.en_name] !== '--';
  const genPair = targetIndex => (l) => [l[sI.en_name], l[targetIndex]];

  const jsResults = {
    'zh-tw': pipe(R.filter(hasEnName), map(genPair(sI.zh_tw_name)), fromPairs, JSON.stringify, addExport)(regionSource),
    'zh-cn': pipe(R.filter(hasEnName), map(genPair(sI.zh_cn_name)), fromPairs, JSON.stringify, addExport)(regionSource),
  };

  jsFilePaths.map((filePath) => {
    const contentKey = split('/')(filePath)[1];

    removeFileByPath(filePath)
      .then(() => writeToFile(filePath, jsResults[contentKey]))
      .then(() => prettyFile(filePath));
  });
};

generateJson();
generateJs();