const request = require('../request')('v1'); // force REST API v1

const USER_WORKSPACES_PATH = '/default-domain/UserWorkspaces';

const createPersonalWorkspace = async (username) => {
  const { body } = await request.strictPost(`/path${USER_WORKSPACES_PATH}`, {
    body: {
      'entity-type': 'document',
      name: username,
      type: 'Workspace',
    },
  });
  return body.uid;
};

const deletePersonalWorkspace = async (username) => {
  await request.strictDel(`/path${USER_WORKSPACES_PATH}/${username}`);
};

module.exports = {
  createPersonalWorkspace,
  deletePersonalWorkspace,
};
