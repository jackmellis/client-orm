var Base = require('../base');
var Collection = require('../collection');
var defaultStorage = require('../../../stores/default');

var Db = Base.extend({
  dependencies : ['_timeToLive_', '_storage_', '_http_'],
  constructor(timeToLive, storage, http) {
    if (!timeToLive){
      timeToLive = 1000 * 60 * 5;
    }
    if (!storage){
      storage = defaultStorage();
    }
    Object.defineProperties(this, {
      $timeToLive : {
        value : timeToLive
      },
      $storage : {
        value : storage
      },
      $http : {
        value : http
      },
      $collections : {
        value : []
      }
    });
  },
  methods : {
    define(options){
      var defaultOptions = {
        timeToLive : this.$timeToLive,
        http : this.$http
      };
      var forcedOptions = {
        db : this
      };
      options = Object.assign({}, defaultOptions, options, forcedOptions);

      var collection = new Collection(options);
      this.$collections.push(collection);
      return collection.Record;
    },
    collection(name){
      return this.$collections
        .filter(c => c.name === name)
        .map(c => c.Record)
        .find(() => true);
    }
  }
});

module.exports = Db;
