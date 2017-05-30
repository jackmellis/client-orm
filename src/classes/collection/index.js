var Base = require('../base');
var methods = require('./methods');

var Collection = Base.extend({
  dependencies : [
    '$promise',
    'db',
    '_http_',
    'collectionSetup',
    'recordExtender',
    '_name_',
    'timeToLive',
    '_api_',
    '_fields_',
    '_relationships_',
    '_primaryKey_',
    '$urlBuilder'
  ],
  constructor($promise, db, http, collectionSetup, recordExtender, name, timeToLive, api, fields, relationships, primaryKey, $urlBuilder){
    this.$promise = $promise;
    this.db = db;
    this.http = http;
    this.timeToLive = timeToLive;
    this.$urlBuilder = $urlBuilder;
    this.$queue = [];

    this.name = collectionSetup.setName(name);
    this.api = collectionSetup.setApi(api);
    this.fields = collectionSetup.setFields(fields);
    this.relationships = collectionSetup.setRelationships(relationships);
    this.primaryKey = collectionSetup.setPrimaryKey(primaryKey);

    this.cache = {};

    this.Record = recordExtender(this);
  },
  methods
});

Object.defineProperties(Collection.prototype, {
  storage : {
    get() {
      return this.db.$storage;
    }
  },
  store : {
    get() {
      return this.storage.store;
    }
  },
  records : {
    get() {
      return this.storage.get(this.store, this.name);
    }
  }
});

module.exports = Collection;

require('./collectionSetup');
require('./recordExtender');
