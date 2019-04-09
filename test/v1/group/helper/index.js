const DEFAULT_ENTITY = {
  'entity-type': 'group',
};

const GROUP2_ID = 'group2';

const GROUP2_PROPERTIES = {
  grouplabel: 'Group 2',
  description: 'The group 2',
};

const GROUP2_ENTITY = {
  ...DEFAULT_ENTITY,
  id: GROUP2_ID,
  properties: GROUP2_PROPERTIES,
};

module.exports = {
  DEFAULT_ENTITY,
  GROUP2_ENTITY,
  GROUP2_ID,
  GROUP2_PROPERTIES,
};
