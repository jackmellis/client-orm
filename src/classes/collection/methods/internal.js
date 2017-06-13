exports.buildUrl = function (url, params, query) {
  let result = this.$urlBuilder.buildUrl(url, params, query);
  if (this.api.alias){
    for (let x = 0; x < this.api.alias.length; x++){
      let alias = this.api.alias[x];
      let match = result.match(alias.match);
      if (match){
        switch (typeof alias.resolve){
        case 'function':
          return alias.resolve.apply(null, match);
        case 'string':
          return result.replace(alias.match, alias.resolve);
        }
      }
    }
  }
  return result;
};

exports.queue = function (callback) {
  var promise = this.$promise((resolve, reject) => {
    this.$queue.push({resolve, reject});
  })
  .then(callback)
  .then(result => {
    this.$queue.shift();
    var next = this.$queue[0];
    next && next.resolve && next.resolve();
    return result;
  }, err => {
    this.$queue.shift();
    var next = this.$queue[0];
    next && next.resolve && next.resolve();
    throw err;
  });

  if (this.$queue.length === 1){
    this.$queue[0].resolve();
  }

  return promise;
};

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

  if (!result && query && this.api.get){
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
    if (Object.hasOwnProperty.call(record, key)){
      obj[key] = record[key];
    }
  });
  return obj;
};
