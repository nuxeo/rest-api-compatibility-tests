const request = require('../request');

const { JOE_AUTH } = require('../../common/joe-user');
const { JACK_UPDATED } = require('./expected');
const { DEFAULT_ENTITY, JACK_ENTITY } = require('./helper');

beforeAll(async () => {
  await request.post(`/user`, {
    body: JACK_ENTITY,
  });
});

afterAll(async () => {
  await request.del(`/user/jack`);
});

t('PUT /user/USER_ID > update user', async () => {
  const { statusCode, body } = await request.put('/user/jack', {
    body: {
      ...DEFAULT_ENTITY,
      id: 'jack',
      properties: {
        firstName: 'John',
        lastName: 'Sprat',
      },
    },
  });
  expect(statusCode).toBe(200);
  expect(body).toMatchObject(JACK_UPDATED);
});

t('PUT /user/USER_ID > update user as unauthorized user', async () => {
  const { statusCode } = await request.put('/user/jack', {
    body: {
      ...DEFAULT_ENTITY,
      id: 'jack',
    },
    auth: JOE_AUTH,
  });
  expect(statusCode).toBe(403);
});

t('PUT /user/USER_ID > update user with unexisting group', async () => {
  const { statusCode } = await request.put('/user/jack', {
    body: {
      ...DEFAULT_ENTITY,
      id: 'jack',
      properties: {
        groups: ['foo'],
      },
    },
  });
  expect(statusCode).toBe(403);
});

t(
  'PUT /user/USER_ID > update user with mismatching id and username',
  async () => {
    const { statusCode } = await request.put('/user/jack', {
      body: {
        ...DEFAULT_ENTITY,
        id: 'jack',
        properties: {
          username: 'foo',
        },
      },
    });
    expect(statusCode).toBe(500);
  },
);

t('PUT /user/USER_ID > update unexisting user', async () => {
  const { statusCode } = await request.put('/user/john', {
    body: {
      ...DEFAULT_ENTITY,
      id: 'john',
    },
  });
  expect(statusCode).toBe(404);
});
