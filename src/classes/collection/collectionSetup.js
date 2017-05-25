const defaultApi = {
  get : {
    method : 'get'
  },
  getOne : {
    method : 'get'
  },
  getById : {
    method : 'get'
  },
  create : {
    method : 'post'
  },
  update : {
    method : 'patch'
  },
  delete : {
    method : 'delete'
  }
};
const defaultRelationship = {
  many : true,
  cascade : false,
  query : {}
};

var Base = require('./');
Base.register.service('collectionSetup', [], function () {
  this.setName = function (name) {
    if (!name || typeof name !== 'string'){
      throw new Error('Could not create collection as no name has been defined');
    }
    return name;
  };

  this.setApi = function (api) {
    if (!api || typeof api !== 'object'){
      return {};
    }
    Object.keys(api).forEach(key => {
      var value = api[key];
      if (typeof value === 'string'){
        value = { url : value };
      }
      api[key] = Object.assign({}, defaultApi[key], value);
    });
    return api;
  };

  this.setFields = function (fields) {
    return fields || {};
  };

  this.setRelationships = function (relationships) {
    if (!relationships){
      relationships = [];
    }
    return relationships.map(rel => {
      rel = Object.assign({}, defaultRelationship, rel);

      if (!rel.name && !rel.collection){
        throw new Error('Relationships must have a name');
      }else if (!rel.name){
        rel.name = rel.collection;
      }else if (!rel.collection){
        rel.collection = rel.name;
      }

      return rel;
    });
  };

  this.setPrimaryKey = function (primaryKey) {
    return primaryKey || 'id';
  };
}).lifecycle.application();
