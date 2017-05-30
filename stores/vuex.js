function makeId() {
  function s4(){
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return [s4() + s4(), s4(), s4(), s4(), s4() + s4() + s4()].join('-');
}

module.exports = function (store) {
  var storage = {};
  storage.store = store;
  storage.get = function (store, name) {
    if (!store.state[name]){
      store.registerModule(name, {
        state : {
          data : [],
          mutations : {
            CREATE(state, payload){
              state.data.push(payload.data);
              return state.data[state.data.length-1];
            },
            UPDATE(state, payload){
              var index = payload.index;
              var existing = state.data[index];
              Object.assign(existing, payload.data);
              state.data.splice(index, 1, existing);
              return existing;
            },
            DELETE(state, payload){
              state.data.splice(payload.index, 1);
            }
          }
        }
      });
    }
    return store.state[name];
  };
  storage.create = function (store, name, payload) {
    if (!payload.id){
      payload.id = makeId();
    }
    return store.commit(name + '/CREATE', {data : payload});
  };
  storage.update = function (store, name, payload, idField) {
    var index = store.state[name].data.map(row => row[idField]).indexOf(payload[idField]);
    return store.commit(name + '/UPDATE', {index, data : payload});
  };
  storage.delete = function (store, name, payload, idField) {
    var index = store.state[name].data.map(row => row[idField]).indexOf(payload[idField]);
    return store.commit(name + '/DELETE', {index});
  };
};
