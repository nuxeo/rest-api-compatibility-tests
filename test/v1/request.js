const path = require('path');
const request = require('../request');

module.exports = request(path.basename(__dirname));
