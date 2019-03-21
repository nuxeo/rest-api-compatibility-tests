const DEFAULT_ENTITY = {
  'entity-type': 'user',
};

const JACK_ENTITY = {
  'entity-type': 'user',
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

module.exports = {
  DEFAULT_ENTITY,
  JACK_ENTITY,
};
