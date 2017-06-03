module.exports = {
  // same as calling new Record()
  create(options){
    return new this(options);
  },
  // adds multiple records to the db
  add(rows){
    const isArray = Array.isArray(rows);
    const result = [].concat(rows || []).map(row => this.create(row).add());
    return isArray ? result : result.find(() => true);
  },
  // returns synchronous list of records from this collection
  get(query){
    return this.$collection.get(query);
  },
  // returns first matching record (synchronous)
  getOne(query){
    return this.$collection.getOne(query);
  },
  // returns record with matching id (synchronous)
  getById(id){
    return this.$collection.getById(id);
  },
  // fetches records from the api (async)
  fetch(query){
    return this.$collection.fetch(query);
  },
  // fetches first matching record from the api (async)
  fetchOne(query){
    return this.$collection.fetchOne(query);
  },
  // fetches record with matching id from the api (async)
  fetchById(id){
    return this.$collection.fetchById(id);
  },
  // waits for all current tasks to complete
  wait(){
    return this.$collection.queue(() => {});
  },
  // clears all cached results
  invalidate(){
    this.$collection.cache = {};
  }
};
