const NUXEO_SERVER_URL =
  process.env.NUXEO_SERVER_URL || 'http://localhost:8080/nuxeo';
const NUXEO_API_URL = `${NUXEO_SERVER_URL}/api`;

const ADMIN_AUTH = {
  user: 'Administrator',
  pass: 'Administrator',
};

const DEFAULT_OPTIONS = {
  auth: ADMIN_AUTH,
  simple: false, // don't fail with an error in case of non-2xx status code
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
 * @param {Object} options - The request options.
 * @param {string} [options.method] - An optional request method, defaults to 'GET'.
 * @param {Object} [options.body] - An optional request body.
 * @param {Object} [options.auth] - An optional request authentication object, defaults to basic authentication with the
 * Administrator user.
 *
 * @returns {function(Object): Promise} A function accepting a `path` and an `options` parameter and returning a
 * promise object resolved with the request's response.
 */
module.exports = (version) => {
  const r = async (path, options) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const {
      auth,
      simple,
      json,
      body,
      method,
      qs,
      headers: extraHeaders,
    } = mergedOptions;

    const computedURL = `${NUXEO_API_URL}/${version}/${path}`;
    const url = new URL(computedURL.replace(/([^:])\/\/+/, '$1/'));
    if (qs) {
      Object.entries(qs).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const headers = { ...extraHeaders };
    if (auth) {
      const encoded = Buffer.from(`${auth.user}:${auth.pass}`).toString(
        'base64',
      );
      headers.Authorization = `Basic ${encoded}`;
    }
    if (json && body) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
      method: method || 'GET',
      headers,
    };
    if (body) {
      fetchOptions.body = json ? JSON.stringify(body) : body;
    }

    const response = await fetch(url, fetchOptions);

    let responseBody;
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    if (json && contentType.includes('application/json') && text) {
      responseBody = JSON.parse(text);
    } else {
      responseBody = text;
    }

    if (simple && !response.ok) {
      const error = new Error(
        `${response.status} - ${response.statusText}: ${typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)}`,
      );
      error.statusCode = response.status;
      error.response = { body: responseBody };
      throw error;
    }

    return { statusCode: response.status, body: responseBody };
  };

  r.get = async (path, options) => r(path, { ...options, method: 'GET' });
  r.post = async (path, options) => r(path, { ...options, method: 'POST' });
  r.put = async (path, options) => r(path, { ...options, method: 'PUT' });
  r.del = async (path, options) => r(path, { ...options, method: 'DELETE' });

  // fail with an error in case of status code other than 2xx
  r.strictGet = async (path, options) =>
    r.get(path, { ...options, simple: true });
  r.strictPost = async (path, options) =>
    r.post(path, { ...options, simple: true });
  r.strictPut = async (path, options) =>
    r.put(path, { ...options, simple: true });
  r.strictDel = async (path, options) =>
    r.del(path, { ...options, simple: true });

  return r;
};
