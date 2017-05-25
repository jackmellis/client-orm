var Base = require('./');
var BaseRecord = require('../record');
Base.register.factory('recordExtender', [], function () {
  return function (collection) {
    var Record = BaseRecord.extend();
    Object.defineProperty(Record, '$collection', {
      value : collection
    });
    Object.defineProperty(Record.prototype, '$collection', {
      value : collection
    });

    var properties = {};
    collection.relationships.forEach(rel => {
      let name = rel.collection;
      let alias = rel.name;
      alias = alias.charAt(0).toUpperCase() + alias.substr(1);
      let queryKeys = Object.keys(rel.query);

      properties['get' + alias] = {
        get(){
          const query = {};
          queryKeys.forEach(key => {
            query[key] = rel.query[key](this);
          });
          const collection = collection.db.collection(name);
          return collection.Record.get(query);
        }
      };

      props['fetch' + alias] = {
        get(){
          const query = {};
          queryKeys.forEach(key => {
            query[key] = rel.query[key](this);
          });
          const collection = collection.db.collection(name);
          return collection.Record.fetch(query);
        }
      };
    });

    Object.defineProperties(Record.prototype, properties);

    return Record;
  };
}).lifecycle.application();
