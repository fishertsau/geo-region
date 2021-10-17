import fs from 'fs';
import { split } from 'ramda';
import { exec } from 'child_process';

/**
 * 清除引號
 * **/
export const clearQuote = (givenStr) => (givenStr.replace(/"/g, ''));

/**
 * 將每一行,轉為array
 * **/
export const lineToArr = (givenStr) => (split(/\n/)(givenStr));

const nullFunc = () => {
};

/**
 * 整理檔案格式
 */
export const prettifyFile = (fileNames, callback = nullFunc) => {
  const cmd = `prettier --write ${fileNames}`;

  exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log('error', new Date().toISOString());
        console.error(err);
      } else {
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout after pretty: ${stdout}`);
        callback();
        // console.log(`stderr: ${stderr}`);
      }
    },
  );
};

/**
 * 刪除檔案
 */
export const removeFileByPath = async (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return true;
};

/**
 * 寫入檔案
 */
export const writeToFile = async (filePath, content) => {
  fs.writeFileSync(filePath, content, { flag: 'a' },
    err => {
      if (err) {
        console.error(err);
        return;
      }
    },
  );

  return true;
};

export const addExport = (givenStr) => `module.exports=${givenStr}`;

export const nowStr = () => new Date().toISOString();
export const timedLog = (msg) => console.log(`${msg}: ${nowStr()}`);
export const justLog = (msg) => console.log(msg);


export const sleep = async (ms) => (new Promise(resolve => setTimeout(resolve, ms)));
