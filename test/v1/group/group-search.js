const request = require('../request');

const {
  SEARCH_ALL_GROUPS,
  SEARCH_ALL_GROUPS_PAGE_0,
  SEARCH_ALL_GROUPS_PAGE_3,
  SEARCH_GROUP1_GROUP,
  SEARCH_NO_GROUP,
} = require('./expected');

t('GET /group/search > search for groups with no query', async () => {
  const { statusCode, body } = await request.get('/group/search');
  expect(statusCode).toBe(200);
  expect(body).toMatchObject(SEARCH_NO_GROUP);
});

t(
  'GET /group/search > search for groups with query returning no groups',
  async () => {
    const { statusCode, body } = await request.get('/group/search', {
      qs: { q: 'foo' },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_NO_GROUP);
  },
);

t(
  'GET /group/search > search for groups with query returning all groups',
  async () => {
    const { statusCode, body } = await request.get('/group/search', {
      qs: { q: '*' },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_ALL_GROUPS);
  },
);

t(
  'GET /group/search > search for groups with query returning all groups and pagination parameters: pageSize=2, currentPageIndex=0',
  async () => {
    const { statusCode, body } = await request.get('/groups/search', {
      qs: {
        q: '*',
        pageSize: 2,
        currentPageIndex: 0,
      },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_ALL_GROUPS_PAGE_0);
  },
);

t(
  'GET /group/search > search for groups with query returning all groups and pagination parameters: pageSize=2, currentPageIndex=3',
  async () => {
    const { statusCode, body } = await request.get('/group/search', {
      qs: {
        q: '*',
        pageSize: 2,
        currentPageIndex: 3,
      },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_ALL_GROUPS_PAGE_3);
  },
);

t(
  'GET /group/search > search for groups with query returning groups matching exact groupname',
  async () => {
    const { statusCode, body } = await request.get('/group/search', {
      qs: { q: 'group1' },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_GROUP1_GROUP);
  },
);

t(
  'GET /group/search > search for groups with query returning groups matching partial groupname',
  async () => {
    const { statusCode, body } = await request.get('/group/search', {
      qs: { q: 'grou' },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_GROUP1_GROUP);
  },
);

t(
  'GET /group/search > search for groups with query returning groups matching group property (grouplabel)',
  async () => {
    const { statusCode, body } = await request.get('/group/search', {
      qs: { q: 'Group 1' },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_GROUP1_GROUP);
  },
);
