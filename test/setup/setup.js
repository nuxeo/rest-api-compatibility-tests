/* eslint no-console: 0 */

const request = require('../request')('v1'); // force REST API v1
const { GROUP1_ENTITY } = require('../common/group1-group');
const { JOE_ENTITY } = require('../common/joe-user');

module.exports = async () => {
  console.log();
  console.log();
  console.log('BEGIN SETUP');

  // create joe user
  let res = await request.post('/user', { body: JOE_ENTITY });
  console.log(`${res.statusCode} - Created ${res.body.id} user`);

  // create group1 group
  res = await request.post('/group', { body: GROUP1_ENTITY });
  console.log(`${res.statusCode} - Created ${res.body.id} group`);

  console.log('END SETUP');
  console.log();
};
