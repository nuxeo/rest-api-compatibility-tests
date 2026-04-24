/* eslint no-console: 0 */

const request = require('../request')('v1'); // force REST API v1
const { GROUP1_ENTITY } = require('../common/group1-group');
const { GROUP1_ID } = require('../common/group1-group');
const { JOE_ENTITY } = require('../common/joe-user');
const { JOE_ID } = require('../common/joe-user');

module.exports = async () => {
  console.log();
  console.log();
  console.log('BEGIN SETUP');

  // create joe user
  let res = await request.strictPost('/user', {
    body: JOE_ENTITY,
  });
  console.log(`${res.statusCode} - Created ${res.body.id} user`);

  // create group1 group
  res = await request.strictPost('/group', {
    body: GROUP1_ENTITY,
  });
  console.log(`${res.statusCode} - Created ${res.body.id} group`);

  console.log('END SETUP');
  console.log();

  // return teardown function
  return async () => {
    console.log();
    console.log('BEGIN TEARDOWN');

    // delete group1 group
    let res = await request.strictDel(`/group/${GROUP1_ID}`);
    console.log(`${res.statusCode} - Deleted group1 group`);

    // delete joe user
    res = await request.strictDel(`/user/${JOE_ID}`);
    console.log(`${res.statusCode} - Deleted joe user`);

    console.log('END TEARDOWN');
    console.log();
  };
};
