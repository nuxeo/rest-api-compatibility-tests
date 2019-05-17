const request = require('../request');

const { JOE_AUTH } = require('../../common/joe-user');
const { GROUP2_ENTITY } = require('./helper');

beforeAll(async () => {
  await request.strictPost('/group', {
    body: GROUP2_ENTITY,
  });
});

afterAll(async () => {
  await request.del('/group/group2');
});

t('DELETE /group/GROUP_ID > delete group', async () => {
  const { statusCode } = await request.del('/group/group2');
  expect(statusCode).toBe(204);
});

t('DELETE /group/GROUP_ID > delete group as unauthorized user', async () => {
  const { statusCode } = await request.del('/group/group1', {
    auth: JOE_AUTH,
  });
  expect(statusCode).toBe(403);
});

t('DELETE /group/GROUP_ID > delete unexisting group', async () => {
  const { statusCode } = await request.del('/group/group3');
  expect(statusCode).toBe(404);
});
