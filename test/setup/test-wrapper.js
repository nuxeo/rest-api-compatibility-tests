const request = require('../request')('v1'); // force REST API v1

global.t = (name, f) => {
  const message = `>>> testing: ${name}`;
  request('/automation/Log', {
    method: 'POST',
    body: {
      params: {
        message,
        category: 'rest-api-compatibility-tests',
        level: 'warn',
      },
    },
  });
  return test(name, f);
};
