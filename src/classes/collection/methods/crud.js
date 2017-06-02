exports.add = function (record) {
  const obj = this.getPlainObject(record);
  const idField = this.primaryKey;
  const id = obj[idField];
  const name = this.name;
  const storage = this.storage;
  const store = this.store;

  const ids = this.records.map(row => row[idField]);
  const index = ids.indexOf(id);

  let result;
  if (index < 0){
    if (this.beforeCreate){
      this.beforeCreate(obj);
    }
    result = storage.create(store, name, obj, idField);
  }else{
    if (this.beforeUpdate){
      this.beforeUpdate(obj);
    }
    result = storage.update(store, name, obj, idField);
  }

  if (result){
    if (record.$set){
      record.$set(result);
    }else{
      record = new this.Record().$set(result);
    }
  }
  return record;
};

exports.remove = function (record) {
  const obj = this.getPlainObject(record);
  const idField = this.primaryKey;
  const id = obj[idField];
  const name = this.name;
  const storage = this.storage;
  const store = this.store;

  const ids = this.records.map(row => row[idField]);
  const index = ids.indexOf(id);

  if (index > -1){
    return storage.delete(store, name, obj, idField);
  }
};

exports.create = function (record) {
  const idField = this.primaryKey;

  return this.queue(() => {
    return this.$promise.resolve()
      .then(() => {
        if (this.api.create && this.http){
          let obj = this.getPlainObject(record);
          return this.http({
            url : this.api.create.url,
            method : this.api.create.method,
            data : obj
          }).then(response => {
            if (response.data){
              return response.data;
            }else{
              return record.toObject();
            }
          });
        }else{
          return record.toObject();
        }
      })
      .then(response => {
        return this.add(response);
      })
      .then(response => {
        record.$changes = {};
        record.$set(response.$proxy);
        return record;
      });
  });
};

exports.update = function (record) {
  const backup = Object.assign({}, record.$proxy);
  const changes = record.$changes;
  const obj = Object.assign({}, changes);
  const idField = this.primaryKey;
  const id = record[idField];
  const params = {};
  obj[idField] = id;
  params[idField] = id;

  // clear the record's changes as they will hopefully be re-set as committed values
  record.$changes = {};

  // update the local store first
  let returnable = this.add(obj);
  if (!returnable || !returnable.then || !returnable.catch){
    returnable = this.$promise.resolve();
  }

  return this.queue(() => {
    return returnable
      .then(() => {
        // send an update request to the api
        if (this.api.update && this.http){
          let url = this.$urlBuilder.buildUrl(this.api.update.url, params);

          return this.http({
            url : url,
            method : this.api.update.method,
            data : obj
          })
          .then(response => {
            // the response may contain amended values, so update the record with them
            if (response.data && response.data[idField]){
              this.add(response.data);
              return record;
            }
          });
        }else{
          return record;
        }
      })
      .catch(err => {
        // restore the original stored value
        this.add(backup);
        // restore the record's changes property
        record.$changes = changes;
        throw err;
      });
  });
};

exports.delete = function (record) {
  const backup = Object.assign({}, record.$proxy);
  const idField = this.primaryKey;
  const id = record[idField];
  const params = {};
  params[idField] = id;
  const relationships = this.relationships.filter(r => r.cascade);

  let returnable = this.remove(record);
  if (!returnable || !returnable.then || !returnable.catch){
    returnable = this.$promise.resolve();
  }

  return this.queue(() => {
    return returnable
      .then(() => {
        if (this.api.delete && this.http){
          let url = this.$urlBuilder.buildUrl(this.api.delete.url, params);

          return this.http({
            url,
            method : this.api.delete.method
          });
        }
      })
      .catch(err => {
        // restore the original stored value
        this.add(backup);
        throw err;
      });
    })
    .then(() => {
      return this.$promise.all(relationships.map(r => {
        const name = 'fetch' + r.name.charAt(0).toUpperCase() + r.name.substr(1);
        return record[name]().then(children => {
          return this.$promise.all([].concat(children || []).map(child => {
            if (r.cascade === 'soft'){
              return child.remove();
            }else{
              return child.delete();
            }
          }));
        });
      }));
    });
};
