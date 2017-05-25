function coerce(types, key, value) {
  if (value === null || value === undefined){
    return value;
  }
  for (let x = 0; x < types.length; x++){
    let coerced = value;
    let type = types[x];

    switch(type){
    case String:
      return '' + value;

    case Number:
      coerced = +value;
      if (isNaN(coerced)){
        throw new Error(`${coerced} is not a number`);
      }
      return coerced;

    case Array:
      return [].concat(value || []);

    case Boolean:
      return !!value;

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
    this.$proxy = fieldValues || {};

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
            return this.$proxy[key];
          }
        },
        set(v){
          v = coerce(types, key, v);

          const target = this.$setting ? '$proxy' : '$changes';
          if (this[target][key] !== v){
            this[target][key] = v;
          }
        }
      };
    });
    Object.defineProperties(this, properties);

    if (fieldValues){
      this.$set(fieldValues);
    }
  },
  static : {
    create(options){
      return new this(options);
    },
    get(query){
      return this.$collection.get(query);
    },
    getOne(query){
      return this.$collection.getOne(query);
    },
    getById(id){
      return this.$collection.getById(id);
    },
    fetch(query){
      return this.$collection.fetch(query);
    },
    fetchOne(query){
      return this.$collection.fetchOne(query);
    },
    fetchById(id){
      return this.$collection.fetchById(id);
    }
  },
  methods : {
    add(){
      this.$collection.add(this);
    },
    save(){
      if (!this.$proxy[this.primaryKey]){
        return this.$collection.create(this);
      }else{
        return this.$collection.update(this);
      }
    },
    delete(){
      return this.$collection.delete(this);
    },
    clone(){
      return new this.constructor(this.toObject());
    },
    toString(){
      return JSON.stringify(this);
    },
    toObject(){
      return this.$collection.getPlainObject(this);
    },
    $set(fieldValues){
      this.$setting = true;
      const validFields = this.$collection.fields;
      Object.keys(fieldValues)
        .filter(key => !!validFields[key])
        .forEach(key => this[key] = fieldValues[key]);
      this.$setting = false;
    }
  },
  properties : {
    $setting : {
      enumerable : false,
      value : false
    },
    $changes : {
      enumerable : false,
      default : () => ({})
    },
    $proxy : {
      enumerable : false,
      value : null
    }
  }
});

module.exports = Record;
