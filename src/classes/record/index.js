function coerce(types, key, value) {
  if (value === null || value === undefined){
    return value;
  }
  // Check if value is already the correct type
  for (let x = 0; x < types.length; x++){
    let type = types[x];
    switch(type){
    case String:
      if (typeof value === 'string'){
        return value;
      }
      break;
    case Number:
      if (typeof value === 'number'){
        return value;
      }
      break;
    case Array:
      if (Array.isArray(value)){
        return value;
      }
      break;
    case Boolean:
      if (typeof value === 'boolean'){
        return value;
      }
      break;
    case Date:
      if (value instanceof Date){
        return value;
      }
      break;
    default:
      return value;
    }
  }
  // Try to coerce the value into a valid type
  for (let x = 0; x < types.length; x++){
    let coerced = value;
    let type = types[x];

    switch(type){
    case String:
      return '' + value;

    case Number:
      coerced = +value;
      if (isNaN(coerced)){
        break;
      }
      return coerced;

    case Array:
      return [].concat(value || []);

    case Boolean:
      return !!value;

    case Date:
      coerced = new Date(value);
      if (isNaN(coerced.getTime())){
        break;
      }
      return coerced;

    default:
      return value;
    }
  }
  throw new Error(`Invalid type for field ${key}: ${value}`);
}

var Base = require('../base');
var Record = Base.extend({
  dependencies : ['$namedParameters'],
  constructor(fieldValues){
    // create a getter and setter for each field
    const properties = {};
    Object.keys(this.$collection.fields).forEach(key => {
      const types = [].concat(this.$collection.fields[key]);

      properties[key] = {
        enumerable : true,
        get(){
          if (Object.hasOwnProperty.call(this.$changes, key)){
            return this.$changes[key];
          }else{
            return coerce(types, key, this.$proxy[key]);
          }
        },
        set(v){
          v = coerce(types, key, v);

          if (this.$changes[key] !== v){
            this.$changes[key] = v;
          }
        }
      };
    });
    Object.defineProperties(this, properties);

    if (fieldValues){
      const validFields = this.$collection.fields;
      Object.keys(fieldValues)
        .filter(key => !!validFields[key])
        .forEach(key => this[key] = fieldValues[key]);
    }
  },
  static : {
    // same as calling new Record()
    create(options){
      return new this(options);
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
    }
  },
  methods : {
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
  },
  properties : {
    $proxy : {
      enumerable : false,
      default : () => ({})
    },
    $changes : {
      enumerable : false,
      default : () => ({})
    }
  }
});

module.exports = Record;
