module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Base = __webpack_require__(19).extend();
if (!Base.$$using['jpex-defaults']) {
  Base.use(__webpack_require__(20));
}
module.exports = Base;

// register some core services
__webpack_require__(17);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Base = __webpack_require__(0);
var methods = __webpack_require__(7);

var Collection = Base.extend({
  dependencies: ['$promise', 'db', '_http_', 'collectionSetup', 'recordExtender', '_name_', 'timeToLive', '_api_', '_fields_', '_relationships_', '_primaryKey_', '_beforeCreate_', '_beforeUpdate_', '$urlBuilder'],
  constructor: function constructor($promise, db, http, collectionSetup, recordExtender, name, timeToLive, api, fields, relationships, primaryKey, beforeCreate, beforeUpdate, $urlBuilder) {
    this.$promise = $promise;
    this.db = db;
    this.http = http;
    this.timeToLive = timeToLive;
    this.$urlBuilder = $urlBuilder;
    this.$queue = [];
    this.beforeCreate = beforeCreate;
    this.beforeUpdate = beforeUpdate;

    this.name = collectionSetup.setName(name);
    this.api = collectionSetup.setApi(api);
    this.fields = collectionSetup.setFields(fields);
    this.relationships = collectionSetup.setRelationships(relationships);
    this.primaryKey = collectionSetup.setPrimaryKey(primaryKey);

    this.cache = {};

    this.Record = recordExtender(this);
  },

  methods: methods
});

Object.defineProperties(Collection.prototype, {
  storage: {
    get: function get() {
      return this.db.$storage;
    }
  },
  store: {
    get: function get() {
      return this.storage.store;
    }
  },
  records: {
    get: function get() {
      return this.storage.get(this.store, this.name);
    }
  }
});

module.exports = Collection;

__webpack_require__(3);
__webpack_require__(9);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Base = __webpack_require__(0);
var Collection = __webpack_require__(1);
var defaultStorage = __webpack_require__(18);

var Db = Base.extend({
  dependencies: ['_timeToLive_', '_storage_', '_http_'],
  constructor: function constructor(timeToLive, storage, http) {
    if (!timeToLive) {
      timeToLive = 1000 * 60 * 5;
    }
    if (!storage) {
      storage = defaultStorage();
    }
    Object.defineProperties(this, {
      $timeToLive: {
        value: timeToLive
      },
      $storage: {
        value: storage
      },
      $http: {
        value: http
      },
      $collections: {
        value: []
      }
    });
  },

  methods: {
    define: function define(options) {
      var defaultOptions = {
        timeToLive: this.$timeToLive,
        http: this.$http
      };
      var forcedOptions = {
        db: this
      };
      options = Object.assign({}, defaultOptions, options, forcedOptions);

      var collection = new Collection(options);
      this.$collections.push(collection);
      return collection.Record;
    },
    collection: function collection(name) {
      return this.$collections.filter(function (c) {
        return c.name === name;
      }).map(function (c) {
        return c.Record;
      }).find(function () {
        return true;
      });
    }
  }
});

module.exports = Db;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var defaultApi = {
  get: {
    method: 'get'
  },
  getOne: {
    method: 'get'
  },
  getById: {
    method: 'get'
  },
  create: {
    method: 'post'
  },
  update: {
    method: 'patch'
  },
  delete: {
    method: 'delete'
  }
};
var defaultRelationship = {
  type: 'many',
  cascade: false,
  query: {}
};

var Base = __webpack_require__(1);
Base.register.service('collectionSetup', [], function () {
  this.setName = function (name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Could not create collection as no name has been defined');
    }
    return name;
  };

  this.setApi = function (api) {
    if (!api || (typeof api === 'undefined' ? 'undefined' : _typeof(api)) !== 'object') {
      return {};
    }
    Object.keys(api).forEach(function (key) {
      var value = api[key];
      if (typeof value === 'string') {
        value = { url: value };
      } else if (Array.isArray(value)) {
        return;
      }
      api[key] = Object.assign({}, defaultApi[key], value);
    });
    return api;
  };

  this.setFields = function (fields) {
    return fields || {};
  };

  this.setRelationships = function (relationships) {
    if (!relationships) {
      relationships = [];
    }
    return relationships.map(function (rel) {
      rel = Object.assign({}, defaultRelationship, rel);

      if (!rel.name && !rel.collection) {
        throw new Error('Relationships must have a name');
      } else if (!rel.name) {
        rel.name = rel.collection;
      } else if (!rel.collection) {
        rel.collection = rel.name;
      }

      return rel;
    });
  };

  this.setPrimaryKey = function (primaryKey) {
    return primaryKey || 'id';
  };
}).lifecycle.application();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.add = function (record) {
  var obj = this.getPlainObject(record);
  var idField = this.primaryKey;
  var id = obj[idField];
  var name = this.name;
  var storage = this.storage;
  var store = this.store;

  var ids = this.records.map(function (row) {
    return row[idField];
  });
  var index = ids.indexOf(id);

  var result = void 0;
  if (index < 0) {
    result = storage.create(store, name, obj, idField);
  } else {
    result = storage.update(store, name, obj, idField);
  }

  if (result) {
    if (record.$set) {
      record.$set(result);
    } else {
      record = new this.Record().$set(result);
    }
  }
  return record;
};

exports.remove = function (record) {
  var obj = this.getPlainObject(record);
  var idField = this.primaryKey;
  var id = obj[idField];
  var name = this.name;
  var storage = this.storage;
  var store = this.store;

  var ids = this.records.map(function (row) {
    return row[idField];
  });
  var index = ids.indexOf(id);

  if (index > -1) {
    return storage.delete(store, name, obj, idField);
  }
};

exports.create = function (record) {
  var _this = this;

  var idField = this.primaryKey;

  return this.queue(function () {
    return _this.$promise.resolve().then(function () {
      if (_this.beforeCreate) {
        _this.beforeCreate(record);
      }

      if (_this.api.create && _this.http) {
        var obj = _this.getPlainObject(record);
        return _this.http({
          url: _this.api.create.url,
          method: _this.api.create.method,
          data: obj
        }).then(function (response) {
          if (response.data) {
            return response.data;
          } else {
            return record.toObject();
          }
        });
      } else {
        return record.toObject();
      }
    }).then(function (response) {
      return _this.add(response);
    }).then(function (response) {
      record.$changes = {};
      record.$set(response.$proxy);
      return record;
    });
  });
};

exports.update = function (record) {
  var _this2 = this;

  if (this.beforeUpdate) {
    this.beforeUpdate(record);
  }

  var backup = Object.assign({}, record.$proxy);
  var changes = record.$changes;
  var obj = Object.assign({}, changes);
  var idField = this.primaryKey;
  var id = record[idField];
  var params = {};
  obj[idField] = id;
  params[idField] = id;

  var transactions = Object.keys(changes).map(function (key) {
    return {
      op: 'replace',
      path: '/' + key,
      value: changes[key]
    };
  });

  // clear the record's changes as they will hopefully be re-set as committed values
  record.$changes = {};

  // update the local store first
  var returnable = this.add(obj);
  if (!returnable || !returnable.then || !returnable.catch) {
    returnable = this.$promise.resolve();
  }

  return this.queue(function () {
    return returnable.then(function () {
      // send an update request to the api
      if (_this2.api.update && _this2.http) {
        var url = _this2.buildUrl(_this2.api.update.url, params);

        return _this2.http({
          url: url,
          method: _this2.api.update.method,
          data: transactions
        }).then(function (response) {
          // the response may contain amended values, so update the record with them
          if (response.data && response.data[idField]) {
            _this2.add(response.data);
            return record;
          }
        });
      } else {
        return record;
      }
    }).catch(function (err) {
      // restore the original stored value
      _this2.add(backup);
      // restore the record's changes property
      record.$changes = changes;
      throw err;
    });
  });
};

exports.delete = function (record) {
  var _this3 = this;

  var backup = Object.assign({}, record.$proxy);
  var idField = this.primaryKey;
  var id = record[idField];
  var params = {};
  params[idField] = id;
  var relationships = this.relationships.filter(function (r) {
    return r.cascade;
  });

  var returnable = this.remove(record);
  if (!returnable || !returnable.then || !returnable.catch) {
    returnable = this.$promise.resolve();
  }

  return this.queue(function () {
    return returnable.then(function () {
      if (_this3.api.delete && _this3.http) {
        var url = _this3.buildUrl(_this3.api.delete.url, params);

        return _this3.http({
          url: url,
          method: _this3.api.delete.method
        });
      }
    }).catch(function (err) {
      // restore the original stored value
      _this3.add(backup);
      throw err;
    });
  }).then(function () {
    return _this3.$promise.all(relationships.map(function (r) {
      var name = 'fetch' + r.name.charAt(0).toUpperCase() + r.name.substr(1);
      return record[name]().then(function (children) {
        return _this3.$promise.all([].concat(children || []).map(function (child) {
          if (r.cascade === 'soft') {
            return child.remove();
          } else {
            return child.delete();
          }
        }));
      });
    }));
  });
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function doFetch(url) {
  var _this = this;

  if (!this.needsFetching(url)) {
    var cached = this.getCache(url);
    if (cached.promises) {
      return this.$promise(function (resolve, reject) {
        cached.promises.push({ resolve: resolve, reject: reject });
      });
    } else {
      return this.$promise.resolve(this.records);
    }
  }
  if (url && this.http) {
    var _cached = this.addToCache(url);

    return this.http({ url: url, method: 'get' }).then(function (response) {
      var result = [].concat(response.data);

      return _this.$promise.all(result.map(function (row) {
        return _this.add(row);
      })).then(function () {
        var records = _this.records;
        var promises = _cached.promises;
        _cached.timestamp = Date.now();
        _cached.promises = null;
        promises.forEach(function (p) {
          return p.resolve(records);
        });
        return records;
      });
    }).catch(function (err) {
      var promises = _cached.promises;
      _cached.promises = null;
      promises.forEach(function (p) {
        return p.reject(err);
      });
      throw err;
    });
  } else {
    return this.$promise.resolve(this.records);
  }
}

exports.getUrl = function (query) {
  var url = this.api.get && this.api.get.url;
  if (!url) {
    return '';
  }
  return this.buildUrl(url, query, query);
};

exports.getOneUrl = function (query) {
  var url = this.api.getOne && this.api.getOne.url;
  if (!url) {
    return '';
  }
  return this.buildUrl(url, query, query);
};

exports.getByIdUrl = function (id) {
  var url = this.api.getById && this.api.getById.url;
  if (!url) {
    return '';
  }
  var query = {};
  query[this.primaryKey] = id;
  return this.buildUrl(url, query);
};

exports.fetch = function (query) {
  var _this2 = this;

  var url = this.getUrl(query);
  return this.queue(function () {
    return function () {
      if (!url) {
        return this.$promise.resolve(this.records);
      } else {
        return doFetch.call(this, url);
      }
    }.call(_this2).then(function (results) {
      return _this2.filterResults(results, query);
    });
  });
};

exports.fetchOne = function (query) {
  var url = this.getOneUrl(query);
  return function () {
    var _this3 = this;

    if (!url) {
      return this.fetch(query);
    } else {
      return this.queue(function () {
        return doFetch.call(_this3, url).then(function (results) {
          return _this3.filterResults(results, query);
        });
      });
    }
  }.call(this).then(function (results) {
    return results.find(function () {
      return true;
    });
  });
};

exports.fetchById = function (id) {
  var _this4 = this;

  var idField = this.primaryKey;
  var query = {};
  query[idField] = id;
  var url = this.getByIdUrl(id);

  if (!url) {
    return this.fetchOne(query);
  } else {
    return this.queue(function () {
      return doFetch.call(_this4, url).then(function (results) {
        return _this4.filterResults(results, query);
      }).then(function (results) {
        return results.find(function () {
          return true;
        });
      });
    });
  }
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.get = function (query) {
  var url = this.getUrl(query);
  if (this.needsFetching(url)) {
    this.fetch(query);
  }
  return this.filterResults(this.records, query);
};

exports.getOne = function (query) {
  var url = this.getOneUrl(query);
  if (this.needsFetching(url)) {
    this.fetchOne(query);
  }
  return this.filterResults(this.records, query).find(function () {
    return true;
  });
};

exports.getById = function (id) {
  if (id === undefined) {
    throw new Error('getById must be called with an id');
  }

  var query = {};
  query[this.primaryKey] = id;
  var url = this.getByIdUrl(id);
  if (this.needsFetching(url)) {
    this.fetchById(id);
  }
  return this.filterResults(this.records, query).find(function () {
    return true;
  });
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var internal = __webpack_require__(8);
var crud = __webpack_require__(4);
var get = __webpack_require__(6);
var fetch = __webpack_require__(5);

module.exports = Object.assign({}, internal, crud, get, fetch);

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.buildUrl = function (url, params, query) {
  var result = this.$urlBuilder.buildUrl(url, params, query);
  if (this.api.alias) {
    for (var x = 0; x < this.api.alias.length; x++) {
      var alias = this.api.alias[x];
      var match = result.match(alias.match);
      if (match) {
        switch (_typeof(alias.resolve)) {
          case 'function':
            return alias.resolve.apply(null, match);
          case 'string':
            return result.replace(alias.match, alias.resolve);
        }
      }
    }
  }
  return result;
};

exports.queue = function (callback) {
  var _this = this;

  var promise = this.$promise(function (resolve, reject) {
    _this.$queue.push({ resolve: resolve, reject: reject });
  }).then(callback).then(function (result) {
    _this.$queue.shift();
    var next = _this.$queue[0];
    next && next.resolve && next.resolve();
    return result;
  }, function (err) {
    _this.$queue.shift();
    var next = _this.$queue[0];
    next && next.resolve && next.resolve();
    throw err;
  });

  if (this.$queue.length === 1) {
    this.$queue[0].resolve();
  }

  return promise;
};

exports.filterResults = function (results, query) {
  var Record = this.Record;
  var keys = query ? Object.keys(query) : [];

  if (keys.length) {
    results = results.filter(function (row) {
      return keys.every(function (key) {
        return row[key] === query[key];
      });
    });
  }

  return results.map(function (row) {
    return new Record().$set(row);
  });
};

exports.getCache = function (query) {
  var key = query || this.api.get && this.api.get.url;
  var result = this.cache[key];

  if (!result && query && this.api.get) {
    key = this.api.get.url + query.substr(query.indexOf('?'));
    if (key === query) {
      return this.getCache();
    } else {
      return this.getCache(key);
    }
  }
  return result;
};

// create a new cache entry
exports.addToCache = function (query) {
  var key = query || this.api.get && this.api.get.url;
  var result = {
    timestamp: null,
    promises: [],
    result: null
  };
  this.cache[key] = result;
  return result;
};

// remove an entry from the cache
exports.removeFromCache = function (query) {
  var key = query || this.api.get && this.api.get.url;
  delete this.cache[key];
};

exports.needsFetching = function (query) {
  var cached = this.getCache(query);
  if (cached) {
    // cached result exists and is still active
    if (cached.timestamp && Date.now() - cached.timestamp < this.timeToLive) {
      return false;
      // cached result is pending so piggyback onto its promise
    } else if (cached.promises) {
      return false;
      // cached result is invalid
    } else {
      this.removeFromCache(query);
    }
  }
  // no cache or invalid cache
  return true;
};

exports.getPlainObject = function (record) {
  var obj = {};
  Object.keys(this.fields).forEach(function (key) {
    if (Object.hasOwnProperty.call(record, key)) {
      obj[key] = record[key];
    }
  });
  return obj;
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Base = __webpack_require__(1);
var BaseRecord = __webpack_require__(11);
Base.register.factory('recordExtender', [], function () {
  return function (collection) {
    var Record = BaseRecord.extend();
    Object.defineProperty(Record, '$collection', {
      value: collection
    });
    Object.defineProperty(Record.prototype, '$collection', {
      value: collection
    });

    var properties = {};
    collection.relationships.forEach(function (rel) {
      var name = rel.collection;
      var alias = rel.name;
      var fetchAlias = 'fetch' + alias.charAt(0).toUpperCase() + alias.substr(1);
      var queryKeys = Object.keys(rel.query);

      properties[alias] = {
        get: function get() {
          var _this = this;

          var query = {};
          queryKeys.forEach(function (key) {
            query[key] = rel.query[key](_this);
          });
          var c = collection.db.collection(name);

          switch (rel.type) {
            case 'one':
              return c.getOne(query);
            default:
              return c.get(query);
          }
        }
      };

      Record.prototype[fetchAlias] = function () {
        var _this2 = this;

        var query = {};
        queryKeys.forEach(function (key) {
          query[key] = rel.query[key](_this2);
        });
        var c = collection.db.collection(name);

        switch (rel.type) {
          case 'one':
            return c.fetchOne(query);
          default:
            return c.fetch(query);
        }
      };
    });

    Object.defineProperties(Record.prototype, properties);

    return Record;
  };
}).lifecycle.application();

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function constructor(fieldValues, coerce) {
  var _this = this;

  // create a getter and setter for each field
  var properties = {};
  Object.keys(this.$collection.fields).forEach(function (key) {
    var types = [].concat(_this.$collection.fields[key]);

    properties[key] = {
      enumerable: true,
      configurable: true,
      get: function get() {
        if (Object.hasOwnProperty.call(this.$changes, key)) {
          return this.$changes[key];
        } else {
          return coerce(types, key, this.$proxy[key]);
        }
      },
      set: function set(v) {
        v = coerce(types, key, v);

        if (this.$changes[key] !== v) {
          this.$changes[key] = v;
        }
      }
    };
  });
  Object.defineProperties(this, properties);

  if (fieldValues) {
    var validFields = this.$collection.fields;
    Object.keys(fieldValues).filter(function (key) {
      return !!validFields[key];
    }).forEach(function (key) {
      return _this[key] = fieldValues[key];
    });
  }
};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(16);

var Base = __webpack_require__(0);
var Record = Base.extend({
  dependencies: ['$namedParameters', 'coerce'],
  'constructor': __webpack_require__(10),
  static: __webpack_require__(14),
  methods: __webpack_require__(12),
  properties: __webpack_require__(13)
});

module.exports = Record;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  // add a record to the internal store, but not the api
  add: function add() {
    return this.$collection.add(this);
  },

  // remove a record from the store, but not the api
  remove: function remove() {
    return this.$collection.remove(this);
  },

  // create or update the record depending on whether an id exists
  save: function save() {
    if (!this.$proxy[this.$collection.primaryKey]) {
      return this.create();
    } else {
      return this.update();
    }
  },
  create: function create() {
    return this.$collection.create(this);
  },
  update: function update() {
    return this.$collection.update(this);
  },

  // delete a record
  delete: function _delete() {
    return this.$collection.delete(this);
  },

  // creates another reference to the current record with its own set of unsaved changes
  // both records will refer to the same store record (this.$proxy)
  copy: function copy() {
    return new this.constructor(this.$changes).$set(this.$proxy);
  },

  // creates a clone of this record.
  // all of the fields have the same values, but it no longer refers to the same $proxy object
  clone: function clone() {
    return this.copy().release();
  },

  // fetches the real record from the store
  fetch: function fetch() {
    var _this = this;

    var id = this[this.$collection.primaryKey];
    var promise = void 0;
    if (id) {
      promise = this.$collection.fetchById(id);
    } else {
      promise = this.$collection.fetchOne(Object.assign({}, this.$proxy, this.$changes));
    }

    return promise.then(function (result) {
      if (result) {
        _this.$set(result.$proxy);
      }
    });
  },

  // removes the link between the record and the store, including the id value
  // this means you can create a new record with the same values
  release: function release() {
    this.$changes = Object.assign({}, this.$proxy, this.$changes);
    this.$proxy = {};
    delete this.$changes[this.$collection.primaryKey];
    return this;
  },

  // clears any committed changes
  restore: function restore() {
    this.$changes = {};
  },
  toString: function toString() {
    return JSON.stringify(this);
  },
  toObject: function toObject() {
    return this.$collection.getPlainObject(this);
  },
  $set: function $set(proxy) {
    this.$proxy = proxy;
    return this;
  }
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  $proxy: {
    enumerable: false,
    default: function _default() {
      return {};
    }
  },
  $changes: {
    enumerable: false,
    default: function _default() {
      return {};
    }
  }
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  // same as calling new Record()
  create: function create(options) {
    return new this(options);
  },

  // adds multiple records to the db
  add: function add(rows) {
    var _this = this;

    var isArray = Array.isArray(rows);
    var result = [].concat(rows || []).map(function (row) {
      return _this.create(row).add();
    });
    return isArray ? result : result.find(function () {
      return true;
    });
  },

  // returns synchronous list of records from this collection
  get: function get(query) {
    return this.$collection.get(query);
  },

  // returns first matching record (synchronous)
  getOne: function getOne(query) {
    return this.$collection.getOne(query);
  },

  // returns record with matching id (synchronous)
  getById: function getById(id) {
    return this.$collection.getById(id);
  },

  // fetches records from the api (async)
  fetch: function fetch(query) {
    return this.$collection.fetch(query);
  },

  // fetches first matching record from the api (async)
  fetchOne: function fetchOne(query) {
    return this.$collection.fetchOne(query);
  },

  // fetches record with matching id from the api (async)
  fetchById: function fetchById(id) {
    return this.$collection.fetchById(id);
  },

  // waits for all current tasks to complete
  wait: function wait() {
    return this.$collection.queue(function () {});
  },

  // clears all cached results
  invalidate: function invalidate() {
    this.$collection.cache = {};
  }
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(2);

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Base = __webpack_require__(0);

Base.register.factory('coerce', [], function () {
  return function coerce(types, key, value) {
    if (value === null || value === undefined) {
      return value;
    }
    // Check if value is already the correct type
    for (var x = 0; x < types.length; x++) {
      var type = types[x];
      switch (type) {
        case String:
          if (typeof value === 'string') {
            return value;
          }
          break;
        case Number:
          if (typeof value === 'number') {
            return value;
          }
          break;
        case Array:
          if (Array.isArray(value)) {
            return value;
          }
          break;
        case Boolean:
          if (typeof value === 'boolean') {
            return value;
          }
          break;
        case Date:
          if (value instanceof Date) {
            return value;
          }
          break;
        default:
          return value;
      }
    }
    // Try to coerce the value into a valid type
    for (var _x = 0; _x < types.length; _x++) {
      var coerced = value;
      var _type = types[_x];

      switch (_type) {
        case String:
          return '' + value;

        case Number:
          coerced = +value;
          if (isNaN(coerced)) {
            break;
          }
          return coerced;

        case Array:
          return [].concat(value || []);

        case Boolean:
          return !!value;

        case Date:
          coerced = new Date(value);
          if (isNaN(coerced.getTime())) {
            break;
          }
          return coerced;

        default:
          return value;
      }
    }
    throw new Error('Invalid type for field ' + key + ': ' + value);
  };
}).lifecycle.application();

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Base = __webpack_require__(0);

Base.register.service('$urlBuilder', [], function () {
  this.buildUrl = function (url, params, query) {
    if (params) {
      url = this.buildParams(url, params);
    }
    if (query) {
      url = this.buildQuery(url, query);
    }
    return url;
  };
  this.buildParams = function (url, params) {
    if (!params || url.indexOf('{') < 0) {
      return url;
    }
    var keys = Object.keys(params);

    var _loop = function _loop(x, l) {
      var key = keys[x];
      var value = params[key];
      var needle = '{' + key + '}';
      url = url.replace(needle, function () {
        return value;
      });
    };

    for (var x = 0, l = keys.length; x < l && url.indexOf('{') >= 0; x++) {
      _loop(x, l);
    }
    return url;
  };
  this.buildQuery = function (url, query) {
    if (!query) {
      return url;
    }
    var oper = '?';
    if (url.indexOf('?') > -1) {
      oper = '&';
    }
    return url + oper + Object.keys(query).map(function (key) {
      var value = query[key];
      var isArray = Array.isArray(value);

      var left = encodeURIComponent(key);
      var right = isArray ? value : [value];

      return right.map(function (value, index) {
        return left + '=' + encodeURIComponent(value);
      }).join('&');
    }).join('&');
  };
}).lifecycle.application();

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function makeId() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return [s4() + s4(), s4(), s4(), s4(), s4() + s4() + s4()].join('-');
}

module.exports = function (store) {
  store = store || {};
  return {
    store: store,
    get: function get(store, name) {
      if (!store[name]) {
        store[name] = [];
      }
      return store[name];
    },
    create: function create(store, name, payload, idField) {
      if (!payload[idField]) {
        payload[idField] = makeId();
      }
      store[name] = store[name].concat(payload);
      return payload;
    },
    update: function update(store, name, payload, idField) {
      var index = store[name].map(function (row) {
        return row[idField];
      }).indexOf(payload[idField]);

      var original = store[name][index];
      Object.assign(original, payload);
      store[name].splice(index, 1, original);
      return original;
    },
    delete: function _delete(store, name, payload, idField) {
      var index = store[name].map(function (row) {
        return row[idField];
      }).indexOf(payload[idField]);

      store[name].splice(index, 1);
    }
  };
};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("jpex");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("jpex-defaults");

/***/ })
/******/ ]);