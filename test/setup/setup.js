/* eslint no-console: 0 */

const request = require('../request')('v1'); // force REST API v1
const { JOE_ENTITY } = require('../common/joe-user');

module.exports = async () => {
  console.log();
  console.log();
  console.log('BEGIN SETUP');

  // create joe user
  const { statusCode } = await request.post('/user', { body: JOE_ENTITY });
  console.log(`${statusCode} - Created joe user`);

  console.log('END SETUP');
  console.log();
};
