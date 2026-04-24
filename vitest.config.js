const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    include: ['**/test/v*/!(helper|expected)/*.js'],
    fileParallelism: false,
    testTimeout: 10000,
    globals: true,
    globalSetup: './test/setup/setup.js',
    setupFiles: ['./test/setup/test-wrapper.js'],
  },
});
