var Base = require('../classes/base');

Base.register.factory('coerce', [], function () {
  return function coerce(types, key, value) {
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
        case Object:
          if (typeof value === 'object') {
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

        case Object:
          if (typeof value === 'string') {
            try {
              coerced = JSON.parse(value);
            } catch (err) {
              coerced = value;
            }
          }
          if (typeof coerced === 'object') {
            return coerced;
          }
          break;

        default:
          return value;
      }
    }
    throw new Error(`Invalid type for field ${key}: ${value}`);
  };
}).lifecycle.application();
