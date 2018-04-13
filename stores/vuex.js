const defaultNamespace = 'clientORM';

function newVuexModule() {
  return {
    namespaced: true,
    state: {
      data: []
    },
    mutations: {
      CREATE(state, payload) {
        state.data.push(payload.data);
        return state.data[state.data.length - 1];
      },
      UPDATE(state, payload) {
        const index = payload.index;
        const existing = state.data[index];
        Object.assign(existing, payload.data);
        state.data.splice(index, 1, existing);
        return existing;
      },
      DELETE(state, payload) {
        state.data.splice(payload.index, 1);
      }
    }
  }
}

module.exports = function(store, namespace) {
  namespace = namespace || defaultNamespace;

  // Create client-orm module under models namespace
  if (!store.state[namespace]) {
    store.registerModule(namespace, {
      namespaced: true,
      state: {}
    });
  }

  return {
    store,
    get(store, name) {
      if (!store.state[namespace][name]) {
        store.registerModule([namespace, name], newVuexModule());
      }
      return store.state[namespace][name].data;
    },
    create(store, name, payload) {
      store.commit(`${namespace}/${name}/CREATE`, { data: payload });
      const data = this.get(store, name);
      return data[data.length - 1];
    },
    update(store, name, payload, idField) {
      const index = this.get(store, name)
        .map(row => row[idField])
        .indexOf(payload[idField]);
      store.commit(`${namespace}/${name}/UPDATE`, { index, data: payload });
      return this.get(store, name)[index];
    },
    delete(store, name, payload, idField) {
      const index = this.get(store, name)
        .map(row => row[idField])
        .indexOf(payload[idField]);
      store.commit(`${namespace}/${name}/DELETE`, { index });
    }
  };
};
