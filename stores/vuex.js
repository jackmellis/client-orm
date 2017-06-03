module.exports = function (store) {
  var storage = {};
  storage.store = store;
  storage.get = function (store, name) {
    if (!store.state[name]){
      store.registerModule(name, {
        namespaced : true,
        state : {
          data : []
        },
        mutations : {
          CREATE : function(state, payload){
            state.data.push(payload.data);
            return state.data[state.data.length-1];
          },
          UPDATE : function(state, payload){
            var index = payload.index;
            var existing = state.data[index];
            Object.assign(existing, payload.data);
            state.data.splice(index, 1, existing);
            return existing;
          },
          DELETE : function(state, payload){
            state.data.splice(payload.index, 1);
          }
        }
      });
    }
    return store.state[name].data;
  };
  storage.create = function (store, name, payload) {
    store.commit(name + '/CREATE', {data : payload});
    return store.state[name].data[store.state[name].data.length-1];
  };
  storage.update = function (store, name, payload, idField) {
    var index = store.state[name].data.map(row => row[idField]).indexOf(payload[idField]);
    store.commit(name + '/UPDATE', {index, data : payload});
    return store.state[name].data[index];
  };
  storage.delete = function (store, name, payload, idField) {
    var index = store.state[name].data.map(row => row[idField]).indexOf(payload[idField]);
    store.commit(name + '/DELETE', {index});
  };
  return storage;
};
