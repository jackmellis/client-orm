var Base = require('jpex').extend();
if (!Base.$$using['jpex-defaults']){
  Base.use(require('jpex-defaults'));
}
module.exports = Base;

// register some core services
require('../services/urlBuilder');
