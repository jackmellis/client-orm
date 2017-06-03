module.exports = {
  // add a record to the internal store, but not the api
  add(){
    return this.$collection.add(this);
  },
  // remove a record from the store, but not the api
  remove(){
    return this.$collection.remove(this);
  },
  // create or update the record depending on whether an id exists
  save(){
    if (!this.$proxy[this.$collection.primaryKey]){
      return this.create();
    }else{
      return this.update();
    }
  },
  create(){
    return this.$collection.create(this);
  },
  update(){
    return this.$collection.update(this);
  },
  // delete a record
  delete(){
    return this.$collection.delete(this);
  },
  // creates another reference to the current record with its own set of unsaved changes
  // both records will refer to the same store record (this.$proxy)
  copy(){
    return new this.constructor(this.$changes).$set(this.$proxy);
  },
  // creates a clone of this record.
  // all of the fields have the same values, but it no longer refers to the same $proxy object
  clone(){
    return this.copy().release();
  },
  // fetches the real record from the store
  fetch(){
    let id = this[this.$collection.primaryKey];
    let promise;
    if (id){
      promise = this.$collection.fetchById(id);
    }else{
      promise = this.$collection.fetchOne(Object.assign({}, this.$proxy, this.$changes));
    }

    return promise.then(result => {
      if (result){
        this.$set(result.$proxy);
      }
    });
  },
  // removes the link between the record and the store, including the id value
  // this means you can create a new record with the same values
  release(){
    this.$changes = Object.assign({}, this.$proxy, this.$changes);
    this.$proxy = {};
    delete this.$changes[this.$collection.primaryKey];
    return this;
  },
  // clears any committed changes
  restore(){
    this.$changes = {};
  },
  toString(){
    return JSON.stringify(this);
  },
  toObject(){
    return this.$collection.getPlainObject(this);
  },
  $set(proxy){
    this.$proxy = proxy;
    return this;
  }
};
