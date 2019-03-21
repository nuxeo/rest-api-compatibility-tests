const JOE_ID = 'joe';

const JOE_PASSWORD = 'joe';

const JOE_AUTH = {
  user: JOE_ID,
  pass: JOE_PASSWORD,
};

const JOE_ENTITY = {
  'entity-type': 'user',
  properties: {
    username: JOE_ID,
    password: JOE_PASSWORD,
    company: 'Nuxeo',
    email: 'devnull@nuxeo.com',
    firstName: 'Joe',
    lastName: 'DiMaggio',
  },
};

module.exports = {
  JOE_AUTH,
  JOE_ENTITY,
  JOE_ID,
  JOE_PASSWORD,
};
