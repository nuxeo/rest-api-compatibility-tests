/* eslint no-console: 0 */

const request = require('../request')('v1'); // force REST API v1
const { GROUP1_ID } = require('../common/group1-group');
const { JOE_ID } = require('../common/joe-user');

module.exports = async () => {
  console.log();
  console.log('BEGIN TEARDOWN');

  // delete group1 group
  let res = await request.del(`/group/${GROUP1_ID}`);
  console.log(`${res.statusCode} - Deleted group1 group`);

  // delete joe user
  res = await request.del(`/user/${JOE_ID}`);
  console.log(`${res.statusCode} - Deleted joe user`);

  console.log('END TEARDOWN');
  console.log();
};
