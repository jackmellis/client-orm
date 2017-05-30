var Base = require('./');
var BaseRecord = require('../record');
Base.register.factory('recordExtender', [], function() {
  return function(collection) {
    var Record = BaseRecord.extend();
    Object.defineProperty(Record, '$collection', {
      value: collection
    });
    Object.defineProperty(Record.prototype, '$collection', {
      value: collection
    });

    var properties = {};
    collection.relationships.forEach(rel => {
      let name = rel.collection;
      let alias = rel.name;
      let fetchAlias = 'fetch' + alias.charAt(0).toUpperCase() + alias.substr(1);
      let queryKeys = Object.keys(rel.query);

      properties[alias] = {
        get(){
          const query = {};
          queryKeys.forEach(key => {
            query[key] = rel.query[key](this);
          });
          const c = collection.db.collection(name);

          switch (rel.type){
          case 'one':
            return c.getOne(query);
          default:
            return c.get(query);
          }
        }
      };

      Record.prototype[fetchAlias] = function() {
        const query = {};
        queryKeys.forEach(key => {
          query[key] = rel.query[key](this);
        });
        const c = collection.db.collection(name);

        switch (rel.type){
        case 'one':
          return c.fetchOne(query);
        default:
          return c.fetch(query);
        }
      }
    });

    Object.defineProperties(Record.prototype, properties);

    return Record;
  };
}).lifecycle.application();
