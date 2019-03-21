const request = require('../request');

const { JOE_AUTH } = require('../../common/joe-user');
const { JACK_ENTITY } = require('./helper');

beforeAll(async () => {
  await request.post('/user', {
    body: JACK_ENTITY,
  });
});

afterAll(async () => {
  await request.del('/user/jack');
});

t('DELETE /user/USER_ID > delete user', async () => {
  const { statusCode } = await request.del('/user/jack');
  expect(statusCode).toBe(204);
});

t('DELETE /user/USER_ID > delete user as unauthorized user', async () => {
  const { statusCode } = await request.del('/user/joe', {
    auth: JOE_AUTH,
  });
  expect(statusCode).toBe(403);
});

t('DELETE /user/USER_ID > delete unexisting user', async () => {
  const { statusCode } = await request.del('/user/john');
  expect(statusCode).toBe(404);
});
