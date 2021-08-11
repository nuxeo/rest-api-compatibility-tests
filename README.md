# Nuxeo Platform REST API Compatibility Tests

[![Jenkins](https://jenkins.platform.dev.nuxeo.com/buildStatus/icon?job=nuxeo/rest-api-compatibility-tests/master)](https://jenkins.platform.dev.nuxeo.com/job/nuxeo/job/rest-api-compatibility-tests/job/master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Dependency Status](https://img.shields.io/david/nuxeo/rest-api-compatibility-tests.svg?style=flat-square)](https://david-dm.org/nuxeo/rest-api-compatibility-tests) [![devDependency Status](https://img.shields.io/david/dev/nuxeo/rest-api-compatibility-tests.svg?style=flat-square)](https://david-dm.org/nuxeo/rest-api-compatibility-tests#info=devDependencies)

## Purpose

This project allows to validate the REST API versions that are supported in the [2021 branch](https://github.com/nuxeo/nuxeo-lts) of the Nuxeo Platform.

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

To run a specific test:

```shell
yarn test --runTestsByPath test/v1/user/user-post.js
```

To run a set of tests matching a given pattern:

```shell
yarn test user-post
```

To display the debug information of the `request` module while running the tests:

```shell
NODE_DEBUG=request yarn test
```

To debug the tests in VS Code, just start the **Debug Jest Tests** debug configuration.

Then, to debug some specific tests, you can use these options in [launch.json](.vscode/launch.json):

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

## Lint/Format

To check linting with ESLint and code style with Prettier:

```shell
yarn lint
```

To format with Prettier:

```shell
yarn format
```

## CI/CD

This set of tests is executed in a [multibranch pipeline](https://jenkins.platform.dev.nuxeo.com/job/nuxeo/job/rest-api-compatibility-tests/) against a Nuxeo server configured as following:

- Docker image: `docker-private.packages.nuxeo.com/nuxeo/nuxeo:2021.x`
- MongoDB
- Elasticsearch

The build fails if at least one test fails.

This job is also triggered by the [nuxeo/lts/nuxeo](https://jenkins.platform.dev.nuxeo.com/job/nuxeo/job/lts/job/nuxeo/) multibranch pipeline:

- On pull requests, to run the REST API tests against the Nuxeo image freshly built from the related branch, and set a GitHub status check on the pull request.
- On the `2021` branch, to run the REST API tests against the `docker-private.packages.nuxeo.com/nuxeo/nuxeo:2021.x` image freshly built from the `2021` branch.

This adds a quality gate for the continuous delivery of the Nuxeo server.
