function makeId() {
  function s4(){
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return [s4() + s4(), s4(), s4(), s4(), s4() + s4() + s4()].join('-');
}

module.exports = function(store){
  store = store || {};
  return {
    store,
    get : function(store, name) {
      if (!store[name]){
        store[name] = [];
      }
      return store[name];
    },
    create : function(store, name, payload, idField) {
      if (!payload[idField]){
        payload[idField] = makeId();
      }
      store[name] = store[name].concat(payload);
      return payload;
    },
    update : function(store, name, payload, idField) {
      var index = store[name]
        .map(row => row[idField])
        .indexOf(payload[idField]);

      var original = store[name][index];
      Object.assign(original, payload);
      store[name].splice(index, 1, original);
      return original;
    },
    delete : function(store, name, payload, idField) {
      var index = store[name]
        .map(row => row[idField])
        .indexOf(payload[idField]);

      store[name].splice(index, 1);
    }
  };
};
