/* eslint no-console: 0 */

const request = require('../request')('v1'); // force REST API v1
const { JOE_ID } = require('../common/joe-user');

module.exports = async () => {
  console.log();
  console.log('BEGIN TEARDOWN');

  // delete joe user
  const { statusCode } = await request.del(`/user/${JOE_ID}`);
  console.log(`${statusCode} - Deleted joe user`);

  console.log('END TEARDOWN');
  console.log();
};
