exports.filterResults = function (results, query) {
  const Record = this.Record;
  const keys = query ? Object.keys(query) : [];

  if (keys.length){
    results = results.filter(function (row) {
      return keys.every(function (key) {
        return row[key] === query[key];
      });
    });
  }

  return results.map(row => new Record().$set(row));
};

exports.getCache = function (query) {
  var key = query || (this.api.get && this.api.get.url);
  var result = this.cache[key];

  if (!result && query){
    key = this.api.get.url + query.substr(query.indexOf('?'));
    if (key === query){
      return this.getCache();
    }else{
      return this.getCache(key);
    }
  }
  return result;
};

// create a new cache entry
exports.addToCache = function (query) {
  var key = query || (this.api.get && this.api.get.url);
  var result = {
    timestamp : null,
    promises : [],
    result : null
  };
  this.cache[key] = result;
  return result;
};

// remove an entry from the cache
exports.removeFromCache = function (query) {
  var key = query || (this.api.get && this.api.get.url);
  delete this.cache[key];
};

exports.needsFetching = function (query) {
  var cached = this.getCache(query);
  if (cached){
    // cached result exists and is still active
    if (cached.timestamp && Date.now() - cached.timestamp < this.timeToLive){
      return false;
    // cached result is pending so piggyback onto its promise
    }else if (cached.promises){
      return false;
    // cached result is invalid
    }else{
      this.removeFromCache(query);
    }
  }
  // no cache or invalid cache
  return true;
};

exports.getPlainObject = function (record) {
  var obj = {};
  Object.keys(this.fields).forEach(function (key) {
    obj[key] = record[key];
  });
  return obj;
};
