const DEFAULT_ENTITY = {
  'entity-type': 'user',
};

const JACK_ENTITY = {
  ...DEFAULT_ENTITY,
  properties: {
    // TODO: remove when fixed on master, see https://jira.nuxeo.com/browse/NXP-27105
    username: 'jack',
    password: 'jack',
    company: 'Nuxeo',
    email: 'devnull@nuxeo.com',
    firstName: 'Jack',
    lastName: 'Doe',
  },
};

const USER_PROFILE_SCHEMA = 'userprofile';
const USER_PROFILE_ENTITY = {
  'entity-type': 'document',
  name: 'testUserProfile',
  type: 'UserProfile',
  properties: {
    [`${USER_PROFILE_SCHEMA}:birthdate`]: '1980-12-20',
    [`${USER_PROFILE_SCHEMA}:gender`]: false,
    [`${USER_PROFILE_SCHEMA}:locale`]: 'en',
    [`${USER_PROFILE_SCHEMA}:phonenumber`]: '06 78 65 98 45',
  },
};

const USER_PROFILE_ENRICHER_HEADER = {
  'enrichers.user': 'userprofile',
};

module.exports = {
  DEFAULT_ENTITY,
  JACK_ENTITY,
  USER_PROFILE_ENRICHER_HEADER,
  USER_PROFILE_ENTITY,
};
