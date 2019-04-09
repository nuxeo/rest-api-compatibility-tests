const request = require('../request');

const { JOE_AUTH, JOE_ID } = require('../../common/joe-user');
const { JACK } = require('./expected');
const { DEFAULT_ENTITY, JACK_ENTITY } = require('./helper');

afterAll(async () => {
  await request.del(`/user/jack`);
});

t('POST /user > create user', async () => {
  const { statusCode, body } = await request.post('/user', {
    body: JACK_ENTITY,
  });
  expect(statusCode).toBe(201);
  expect(body).toMatchObject(JACK);
});

t('POST /user > create user as unauthorized user', async () => {
  const { statusCode } = await request.post('/user', {
    body: {
      ...DEFAULT_ENTITY,
      properties: {
        username: 'john',
      },
    },
    auth: JOE_AUTH,
  });
  expect(statusCode).toBe(403);
});

t('POST /user > create user with missing username', async () => {
  const { statusCode } = await request.post('/user', {
    body: DEFAULT_ENTITY,
  });
  expect(statusCode).toBe(400);
});

t('POST /user > create user with unexisting group', async () => {
  const { statusCode } = await request.post('/user', {
    body: {
      ...DEFAULT_ENTITY,
      properties: {
        username: 'john',
        groups: ['foo'],
      },
    },
  });
  expect(statusCode).toBe(403);
});

t('POST /user > create existing user', async () => {
  const { statusCode } = await request.post('/user', {
    body: {
      ...DEFAULT_ENTITY,
      properties: {
        username: JOE_ID,
      },
    },
  });
  expect(statusCode).toBe(409);
});
