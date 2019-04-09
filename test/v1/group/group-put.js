const request = require('../request');

const { JOE_AUTH } = require('../../common/joe-user');
const { GROUP2_UPDATED } = require('./expected');
const { DEFAULT_ENTITY, GROUP2_ENTITY, GROUP2_ID } = require('./helper');

beforeAll(async () => {
  await request.post('/group', {
    body: GROUP2_ENTITY,
  });
});

afterAll(async () => {
  await request.del('/group/group2');
});

t('PUT /group/GROUP_ID > update group', async () => {
  const { statusCode, body } = await request.put('/group/group2', {
    body: {
      ...DEFAULT_ENTITY,
      id: GROUP2_ID,
      properties: {
        grouplabel: 'Group 2 updated',
        description: 'The group 2 updated',
      },
    },
  });
  expect(statusCode).toBe(200);
  expect(body).toMatchObject(GROUP2_UPDATED);
});

t('PUT /group/GROUP_ID > update group as unauthorized user', async () => {
  const { statusCode } = await request.put('/group/group2', {
    body: {
      ...DEFAULT_ENTITY,
      id: GROUP2_ID,
    },
    auth: JOE_AUTH,
  });
  expect(statusCode).toBe(403);
});

t(
  'PUT /group/GROUP_ID > update unexisting group (wrong path parameter)',
  async () => {
    const { statusCode } = await request.put('/group/group3', {
      body: DEFAULT_ENTITY,
    });
    expect(statusCode).toBe(404);
  },
);

t(
  'PUT /group/GROUP_ID > update unexisting group (missing id field)',
  async () => {
    const { statusCode } = await request.put('/group/group2', {
      body: DEFAULT_ENTITY,
    });
    expect(statusCode).toBe(500);
  },
);

t(
  'PUT /group/GROUP_ID > update group with mismatching path parameter and id field',
  async () => {
    const { statusCode } = await request.put('/group/group2', {
      body: {
        ...DEFAULT_ENTITY,
        id: 'group3',
      },
    });
    expect(statusCode).toBe(500);
  },
);

t(
  'PUT /group/GROUP_ID > update group with mismatching path parameter and groupname compatibility field',
  async () => {
    const { statusCode } = await request.put('/group/group2', {
      body: {
        ...DEFAULT_ENTITY,
        groupname: 'group3',
      },
    });
    expect(statusCode).toBe(500);
  },
);
