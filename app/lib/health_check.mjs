const healthCheck = async (ctx, next) => {
  if (ctx.path === '/check') {
    ctx.body = { result: 'ok', msg: 'health' };
    return;
  }
  await next();
};

export default (app) => {
  app.use(healthCheck);
};