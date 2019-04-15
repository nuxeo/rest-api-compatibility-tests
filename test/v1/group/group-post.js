const request = require('../request');

const { GROUP1_ID } = require('../../common/group1-group');
const { JOE_AUTH } = require('../../common/joe-user');
const { GROUP2, GROUP2_FETCH_PROPERTIES } = require('./expected');
const {
  DEFAULT_ENTITY,
  GROUP2_ENTITY,
  GROUP2_ID,
  GROUP2_PROPERTIES,
  GROUP_FETCH_PROPERTIES,
} = require('./helper');

afterEach(async () => {
  await request.del('/group/group2');
});

t('POST /group > create group', async () => {
  const { statusCode, body } = await request.post('/group', {
    body: GROUP2_ENTITY,
  });
  expect(statusCode).toBe(201);
  expect(body).toMatchObject(GROUP2);
});

t('POST /group > create group with fetch properties', async () => {
  const { statusCode, body } = await request.post('/group', {
    body: {
      ...GROUP2_ENTITY,
      memberUsers: ['joe', 'jack'],
      memberGroups: ['group3'],
      parentGroups: ['group1'],
    },
    headers: GROUP_FETCH_PROPERTIES,
  });
  expect(statusCode).toBe(201);
  expect(body).toMatchObject(GROUP2_FETCH_PROPERTIES);
});

t('POST /group > create group with groupname property', async () => {
  const { statusCode, body } = await request.post('/group', {
    body: {
      ...DEFAULT_ENTITY,
      properties: {
        groupname: GROUP2_ID,
        ...GROUP2_PROPERTIES,
      },
    },
  });
  expect(statusCode).toBe(201);
  expect(body).toMatchObject(GROUP2);
});

t('POST /group > create group with groupname compatibility field', async () => {
  const { statusCode, body } = await request.post('/group', {
    body: {
      ...DEFAULT_ENTITY,
      groupname: GROUP2_ID,
      properties: GROUP2_PROPERTIES,
    },
  });
  expect(statusCode).toBe(201);
  expect(body).toMatchObject(GROUP2);
});

t(
  'POST /group > create group with groupname compatibility field taking precedence over id',
  async () => {
    const { statusCode, body } = await request.post('/group', {
      body: {
        ...DEFAULT_ENTITY,
        id: 'group3',
        groupname: GROUP2_ID,
        properties: GROUP2_PROPERTIES,
      },
    });
    expect(statusCode).toBe(201);
    expect(body).toMatchObject(GROUP2);
  },
);

t(
  'POST /group > create group with groupname compatibility field taking precedence over groupname property',
  async () => {
    const { statusCode, body } = await request.post('/group', {
      body: {
        ...DEFAULT_ENTITY,
        groupname: GROUP2_ID,
        properties: {
          groupname: 'group3',
          ...GROUP2_PROPERTIES,
        },
      },
    });
    expect(statusCode).toBe(201);
    expect(body).toMatchObject(GROUP2);
  },
);

t('POST /group > create group as unauthorized user', async () => {
  const { statusCode } = await request.post('/group', {
    body: {
      ...DEFAULT_ENTITY,
      properties: {
        groupname: GROUP2_ID,
      },
    },
    auth: JOE_AUTH,
  });
  expect(statusCode).toBe(403);
});

t('POST /group > create group with missing group id', async () => {
  const { statusCode } = await request.post('/group', {
    body: DEFAULT_ENTITY,
  });
  expect(statusCode).toBe(400);
});

t('POST /group > create existing group', async () => {
  const { statusCode } = await request.post('/group', {
    body: {
      ...DEFAULT_ENTITY,
      id: GROUP1_ID,
    },
  });
  expect(statusCode).toBe(409);
});
