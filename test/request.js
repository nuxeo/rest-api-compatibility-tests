const request = require('request-promise-native');

const NUXEO_SERVER_URL =
  process.env.NUXEO_SERVER_URL || 'http://localhost:8080/nuxeo';
const NUXEO_API_URL = `${NUXEO_SERVER_URL}/api`;

const ADMIN_AUTH = {
  user: 'Administrator',
  pass: 'Administrator',
};

const DEFAULT_OPTIONS = {
  auth: ADMIN_AUTH,
  simple: false, // don't fail with StatusCodeError in case of 404
  resolveWithFullResponse: true,
  json: true,
};

/**
 * Curried function that makes a REST API request on the {@link NUXEO_API_URL} with the given version, path and options.
 *
 * @example
 * ```javascript
 * const request = require('./request');
 * // PUT ${NUXEO_API_URL}/v1/user/joe
 * const { statusCode, body } = await request('v1')('/user/joe', {
 *   method: 'PUT',
 *   body: {
 *     'entity-type': 'user',
 *     id: 'joe',
 *     properties: {
 *       firstName: 'Joe',
 *       lastName: 'DiMaggio',
 *     },
 *   },
 * });
 * // or
 * const { statusCode, body } = await request('v1').put('/user/joe', {
 *   body: {
 *     ...
 *   },
 * });
 * ```
 *
 * @param {string} version - The REST API version.
 * @param {string} path - The REST API endpoint path.
 * @param {Object} options - The request's options.
 * @param {string} options.method - The request method.
 * @param {Object} [options.body] - An optional request body.
 * @param {Object} [options.auth] - An optional request authentication object, defaults to basic authentication with the
 * Administrator user.
 *
 * @returns {function(Object): Promise} A function accepting a `path` and an `options` parameter and returning a
 * promise object resolved with the request's response.
 */
module.exports = (version) => {
  const r = async (path, options) => {
    const computedURI = `${NUXEO_API_URL}/${version}/${path}`;
    const uri = computedURI.replace(/([^:])\/\/+/, '$1/');
    const requestOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
      uri,
    };
    return request(requestOptions);
  };

  r.get = async (path, options) => r(path, { ...options, method: 'GET' });
  r.post = async (path, options) => r(path, { ...options, method: 'POST' });
  r.put = async (path, options) => r(path, { ...options, method: 'PUT' });
  r.del = async (path, options) => r(path, { ...options, method: 'DELETE' });

  return r;
};
