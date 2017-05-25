var internal = require('./internal');
var crud = require('./crud');
var get = require('./get');
var fetch = require('./fetch');

module.exports = Object.assign({}, internal, crud, get, fetch);
