const request = require('../request');

const { JOE_GROUP2 } = require('./expected');
const { GROUP2_ENTITY } = require('./helper');

beforeAll(async () => {
  await request.strictPost('/group', {
    body: GROUP2_ENTITY,
  });
});

afterAll(async () => {
  await request.strictDel('/group/group2');
});

t('POST /group/GROUP_ID/user/USER_ID > add user to group', async () => {
  const { statusCode, body } = await request.post('/group/group2/user/joe');
  expect(statusCode).toBe(201);
  expect(body).toMatchObject(JOE_GROUP2);
});

t(
  'POST /group/GROUP_ID/user/USER_ID > add user to unexisting group',
  async () => {
    const { statusCode } = await request.post('/group/group3/user/joe');
    expect(statusCode).toBe(404);
  },
);

t(
  'POST /group/GROUP_ID/user/USER_ID > add unexisting user to group',
  async () => {
    const { statusCode } = await request.post('/group/group2/user/john');
    expect(statusCode).toBe(404);
  },
);
