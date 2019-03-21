const request = require('../request');

const { JACK_ENTITY } = require('./helper');

beforeAll(async () => {
  const body = { ...JACK_ENTITY };
  body.properties.groups = ['members'];
  await request.post('/user', {
    body,
  });
});

afterAll(async () => {
  await request.del('/user/jack');
});

t('DELETE /user/USER_ID/group/GROUP_ID > remove user from group', async () => {
  const { statusCode } = await request.del('/user/jack/group/members');
  expect(statusCode).toBe(200);
});

t(
  'DELETE /user/USER_ID/group/GROUP_ID > remove user from unexisting group',
  async () => {
    const { statusCode } = await request.del('/user/jack/group/foo');
    expect(statusCode).toBe(404);
  },
);
