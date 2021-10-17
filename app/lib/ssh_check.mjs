const sshCheck = (givenApp) => async (ctx, next) => {
  const noConnection = (!givenApp.sshClient || !givenApp.sshConn);
  const msg = noConnection ? 'no-connection' : 'ssh-health';

  if (ctx.path === '/ssh') {
    ctx.body = { result: 'ok', msg };
    return;
  }
  await next();
};

export default (app) => {
  app.use(sshCheck(app));
};