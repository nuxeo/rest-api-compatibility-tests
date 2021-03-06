const request = require('../request');

const {
  SEARCH_ALL_USERS,
  SEARCH_ALL_USERS_PAGE_0,
  SEARCH_ALL_USERS_PAGE_2,
  SEARCH_JOE_USER,
  SEARCH_NO_USER,
} = require('./expected');

t('GET /user/search > search for users with no query', async () => {
  const { statusCode, body } = await request.get('/user/search');
  expect(statusCode).toBe(200);
  expect(body).toMatchObject(SEARCH_NO_USER);
});

t(
  'GET /user/search > search for users with query returning no users',
  async () => {
    const { statusCode, body } = await request.get('/user/search', {
      qs: { q: 'foo' },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_NO_USER);
  },
);

t(
  'GET /user/search > search for users with query returning all users',
  async () => {
    const { statusCode, body } = await request.get('/user/search', {
      qs: { q: '*' },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_ALL_USERS);
  },
);

t(
  'GET /user/search > search for users with query returning all users and pagination parameters: pageSize=1, currentPageIndex=0',
  async () => {
    const { statusCode, body } = await request.get('/user/search', {
      qs: {
        q: '*',
        pageSize: 1,
        currentPageIndex: 0,
      },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_ALL_USERS_PAGE_0);
  },
);

t(
  'GET /user/search > search for users with query returning all users and pagination parameters: pageSize=1, currentPageIndex=2',
  async () => {
    const { statusCode, body } = await request.get('/user/search', {
      qs: {
        q: '*',
        pageSize: 1,
        currentPageIndex: 2,
      },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_ALL_USERS_PAGE_2);
  },
);

t(
  'GET /user/search > search for users with query returning users matching exact username',
  async () => {
    const { statusCode, body } = await request.get('/user/search', {
      qs: { q: 'joe' },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_JOE_USER);
  },
);

t(
  'GET /user/search > search for users with query returning users matching partial username',
  async () => {
    const { statusCode, body } = await request.get('/user/search', {
      qs: { q: 'jo' },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_JOE_USER);
  },
);

t(
  'GET /user/search > search for users with query returning users matching user property (lastName)',
  async () => {
    const { statusCode, body } = await request.get('/user/search', {
      qs: { q: 'DiMaggio' },
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(SEARCH_JOE_USER);
  },
);
