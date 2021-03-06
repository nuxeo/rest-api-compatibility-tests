const request = require('../request');

const {
  createPersonalWorkspace,
  createUserWorkspaceRoot,
  deletePersonalWorkspace,
  deleteUserWorkspaceRoot,
} = require('../../common/personal-workspace');
const { JOE_ID } = require('../../common/joe-user.js');
const { JOE_USERPROFILE, JACK_EMPTY_USERPROFILE } = require('./expected');
const {
  JACK_ENTITY,
  USER_PROFILE_ENRICHER_HEADER,
  USER_PROFILE_ENTITY,
} = require('./helper');

beforeAll(async () => {
  // create user workspace root
  await createUserWorkspaceRoot();

  // create joe's personal workspace
  const personalWorkspaceId = await createPersonalWorkspace(JOE_ID);

  // create joe's user profile document
  await request.strictPost(`/id/${personalWorkspaceId}`, {
    body: USER_PROFILE_ENTITY,
  });

  // create jack user without user profile document
  await request.strictPost('/user', {
    body: JACK_ENTITY,
  });
});

afterAll(async () => {
  // delete jack user
  await request.strictDel('/user/jack');

  // delete joe's personal workspace
  await deletePersonalWorkspace(JOE_ID);

  // delete jack's personal workspace
  await deletePersonalWorkspace('jack');

  // delete user workspace root
  await deleteUserWorkspaceRoot();
});

t(
  'GET /user/USER_ID enrichers.users=userprofile > existing user profile',
  async () => {
    const { statusCode, body } = await request.get('/user/joe', {
      headers: USER_PROFILE_ENRICHER_HEADER,
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(JOE_USERPROFILE);
  },
);

t(
  'GET /user/USER_ID enrichers.users=userprofile > empty user profile',
  async () => {
    const { statusCode, body } = await request.get('/user/jack', {
      headers: USER_PROFILE_ENRICHER_HEADER,
    });
    expect(statusCode).toBe(200);
    expect(body).toMatchObject(JACK_EMPTY_USERPROFILE);
  },
);
