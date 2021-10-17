import fs from 'fs';
import { Client } from 'ssh2';
import { justLog, timedLog } from '../lib/utils.mjs';

const sshClient = new Client();

let sshConn = undefined;

// todo: move config to a central place
const doSshConnection = async (client) => {
    sshConn = await client.connect({
        port: 22,
        privateKey: fs.readFileSync('/Users/fisher_tsau/.ssh/newkey'),
        passphrase: 're',
        host: '35.229.205.67',
        username: 'fisher_tsau',
      },
    );
};

const sendTestShellCmd = () => {
  try {
    sshConn.shell(function (err, stream) {
      if (err) throw err;

      stream.on('data', function (data) {
        justLog(`OUTPUT: ${data}`);
      });

      stream.on('close', function () {
        timedLog('Stream :: close');
      });

      // 送出 shell command
      stream.end('\ndate\nls\nexit\n');
      // stream.end('\ndate\npwd\nls -l\n');
    });
  } catch (e) {
    return Promise.resolve(`${e}`);
  }
};

const bindEvents = async (app) => {
  sshClient.on('ready', () => {
    timedLog('Ssh connection ready@');
    // app.sshClient = sshClient;
    app.sshConn = sshConn;
    // todo: send an event here
  });

  sshClient.on('close', () => {
    console.log('ssh closed!!!');
    timedLog('Ssh connection close@');
    // todo: send an event here
  });

  sshClient.on('end', () => {
    console.log('ssh end!!!');
    // todo: send an event here
  });

  sshClient.on('error', (err) => {
    console.log('something wrong', new Date().toISOString());
    console.log(err);
    app.sshClient = undefined;
    // todo: send an event here
  });
};

export default async (app) => {
  app.sshClient = sshClient;

  if (sshConn) {
    return true;
  }

  return bindEvents(app)
    .then(async () => {
      await doSshConnection(sshClient);
      return true;
    });
}