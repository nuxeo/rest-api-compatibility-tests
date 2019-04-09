const request = require('../request');

const { GROUP1 } = require('./expected');

t('GET /group/GROUP_ID > get group', async () => {
  const { statusCode, body } = await request.get('/group/group1');
  expect(statusCode).toBe(200);
  expect(body).toMatchObject(GROUP1);
});

t('GET /group/GROUP_ID > get unexisting group', async () => {
  const { statusCode } = await request.get('/group/group3');
  expect(statusCode).toBe(404);
});
