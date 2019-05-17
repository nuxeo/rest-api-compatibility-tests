const request = require('../request')('v1'); // force REST API v1

const DEFAULT_DOMAIN_PATH = '/default-domain';
const USER_WORKSPACES_PATH = `${DEFAULT_DOMAIN_PATH}/UserWorkspaces`;

const createUserWorkspaceRoot = async () => {
  await request.strictPost(`path${DEFAULT_DOMAIN_PATH}`, {
    body: {
      'entity-type': 'document',
      name: 'UserWorkspaces',
      type: 'UserWorkspacesRoot',
    },
  });
};

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

const deleteUserWorkspaceRoot = async () => {
  await request.strictDel(`/path${USER_WORKSPACES_PATH}`);
};

module.exports = {
  createPersonalWorkspace,
  createUserWorkspaceRoot,
  deletePersonalWorkspace,
  deleteUserWorkspaceRoot,
};
