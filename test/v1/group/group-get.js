const request = require('../request');

const { GROUP1, GROUP2_FETCH_PROPERTIES } = require('./expected');
const { GROUP2_ENTITY, GROUP_FETCH_PROPERTIES } = require('./helper');

beforeAll(async () => {
  await request.post('/group', {
    body: {
      ...GROUP2_ENTITY,
      memberUsers: ['joe', 'jack'],
      memberGroups: ['group3'],
      parentGroups: ['group1'],
    },
  });
});

afterAll(async () => {
  await request.del('/group/group2');
});

t('GET /group/GROUP_ID > get group', async () => {
  const { statusCode, body } = await request.get('/group/group1');
  expect(statusCode).toBe(200);
  expect(body).toMatchObject(GROUP1);
});

t('GET /group/GROUP_ID > get group with fetch properties', async () => {
  const { statusCode, body } = await request.get('/group/group2', {
    headers: GROUP_FETCH_PROPERTIES,
  });
  expect(statusCode).toBe(200);
  expect(body).toMatchObject(GROUP2_FETCH_PROPERTIES);
});

t('GET /group/GROUP_ID > get unexisting group', async () => {
  const { statusCode } = await request.get('/group/group3');
  expect(statusCode).toBe(404);
});
