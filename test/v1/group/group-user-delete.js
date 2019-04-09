const request = require('../request');

const { GROUP2_ENTITY } = require('./helper');

beforeAll(async () => {
  const body = { ...GROUP2_ENTITY };
  body.memberUsers = ['joe'];
  await request.post('/group', {
    body,
  });
});

afterAll(async () => {
  await request.del('/group/group2');
});

t('DELETE /group/GROUP_ID/user/USER_ID > remove user from group', async () => {
  const { statusCode } = await request.del('/group/group2/user/joe');
  expect(statusCode).toBe(200);
});

t(
  'DELETE /group/GROUP_ID/user/USER_ID > remove user from unexisting group',
  async () => {
    const { statusCode } = await request.del('/group/group3/user/joe');
    expect(statusCode).toBe(404);
  },
);

t(
  'DELETE /group/GROUP_ID/user/USER_ID > remove unexisting user from group',
  async () => {
    const { statusCode } = await request.del('/group/group2/user/john');
    expect(statusCode).toBe(404);
  },
);
