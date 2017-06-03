require('../../services/coerce');

var Base = require('../base');
var Record = Base.extend({
  dependencies : ['$namedParameters', 'coerce'],
  'constructor' : require('./constructor'),
  static : require('./static'),
  methods : require('./methods'),
  properties : require('./properties')
});

module.exports = Record;
