# Nuxeo Platform REST API Compatibility Tests

[![Jenkins](https://jenkins.platform.dev.nuxeo.com/buildStatus/icon?job=nuxeo/rest-api-compatibility-tests/master)](https://jenkins.platform.dev.nuxeo.com/job/nuxeo/job/rest-api-compatibility-tests/job/master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Dependency Status](https://img.shields.io/david/nuxeo/rest-api-compatibility-tests.svg?style=flat-square)](https://david-dm.org/nuxeo/rest-api-compatibility-tests) [![devDependency Status](https://img.shields.io/david/dev/nuxeo/rest-api-compatibility-tests.svg?style=flat-square)](https://david-dm.org/nuxeo/rest-api-compatibility-tests#info=devDependencies)

## Purpose

This project allows to validate the REST API versions that are supported in the [master branch](https://github.com/nuxeo/nuxeo) of the Nuxeo Platform.

For each REST API version, we need to guarantee the following assertion:

> For a given input, i.e. HTTP method, URI, query parameters, headers and request body, the client will always receive the same output, i.e. status code, response headers and response body.

This ensures compatibility between the Nuxeo Platform and the clients using any supported version of the REST API.

## Example

Let's say that:

- Server version 1.0 is released with REST API version 1.
- Server version 2.0 is released with REST API version 2.

Calling the REST API version 1 must work exactly the same as on server 1.0 and server 2.0.

Clients must be able to call the REST API version 1 or 2 on server 2.0.

## Tests

The goal is to provide a complete test coverage of HTTP requests for each supported REST API version. This includes:

- Endpoints.
- Fetch properties.
- Enrichers.
- Web adapters.

To install the project's dependencies:

```shell
yarn
```

To run the tests, make sure that a Nuxeo server is up and available at `http://localhost:8080/nuxeo`, or the value of the `NUXEO_SERVER_URL` environment variable, then run:

```shell
yarn test
```

To check linting with ESLint and code style with Prettier:

```shell
yarn lint
```

To format with Prettier:

```shell
yarn format
```

To debug the tests in VS Code, just start the **Debug Jest Tests** debug configuration.

To debug some specific tests, you can use these options in [launch.json](.vscode/launch.json):

```json
"runtimeArgs": [
  ...
  "--testPathPattern=user-post",
  "--testNamePattern=unauthorized"
],
```

## Structure

```shell
test/v1/group/group-delete.js
test/v1/group/group-get.js
test/v1/group/...
test/v1/user/user-delete.js
test/v1/user/user-enrichers.js
test/v1/user/...
test/v1/...
```

## CI/CD

This set of tests is executed in a [continuous integration pipeline](https://jenkins.platform.dev.nuxeo.com/job/nuxeo/job/rest-api-compatibility-tests/) against a Nuxeo Platform configured as following:

- Docker image: `nuxeo/nuxeo:11.x`
- MongoDB
- Elasticsearch

The build fails if at least one test fails.

This allows continuous delivery of the Nuxeo Platform's master branch in terms of REST API.
