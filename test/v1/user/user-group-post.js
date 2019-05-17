const request = require('../request');

const { JACK_IN_MEMBERS } = require('./expected');
const { JACK_ENTITY } = require('./helper');

beforeAll(async () => {
  await request.strictPost('/user', {
    body: JACK_ENTITY,
  });
});

afterAll(async () => {
  await request.strictDel('/user/jack');
});

t('POST /user/USER_ID/group/GROUP_ID > add user to group', async () => {
  const { statusCode, body } = await request.post('/user/jack/group/members');
  expect(statusCode).toBe(201);
  expect(body).toMatchObject(JACK_IN_MEMBERS);
});

t(
  'POST /user/USER_ID/group/GROUP_ID > add user to unexisting group',
  async () => {
    const { statusCode } = await request.post('/user/jack/group/foo');
    expect(statusCode).toBe(404);
  },
);

t(
  'POST /user/USER_ID/group/GROUP_ID > add unexisting user to group',
  async () => {
    const { statusCode } = await request.post('/user/foo/group/members');
    expect(statusCode).toBe(404);
  },
);
