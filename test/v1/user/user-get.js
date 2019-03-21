const request = require('../request');

const { JOE } = require('./expected');

t('GET /user/USER_ID > get user', async () => {
  const { statusCode, body } = await request.get('/user/joe');
  expect(statusCode).toBe(200);
  expect(body).toMatchObject(JOE);
});

t('GET /user/USER_ID > get transient user', async () => {
  const { statusCode } = await request.get('/user/transient/foo@bar.com/666');
  expect(statusCode).toBe(200);
});

t('GET /user/USER_ID > get unexisting user', async () => {
  const { statusCode } = await request.get('/user/jack');
  expect(statusCode).toBe(404);
});
