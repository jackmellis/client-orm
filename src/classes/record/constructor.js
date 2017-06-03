module.exports = function constructor(fieldValues, coerce){
  // create a getter and setter for each field
  const properties = {};
  Object.keys(this.$collection.fields).forEach(key => {
    const types = [].concat(this.$collection.fields[key]);

    properties[key] = {
      enumerable : true,
      configurable : true,
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
};
