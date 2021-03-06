function doFetch(url) {
  // Check if there's a current request
  let cached;
  cached = this.getCache(url);
  if (cached && cached.promises) {
    return this.$promise((resolve, reject) => {
      cached.promises.push({resolve, reject});
    });
  }
  /*if (!this.needsFetching(url)){
    let cached = this.getCache(url);
    if (cached.promises){
      return this.$promise((resolve, reject) => {
        cached.promises.push({resolve, reject});
      });
    }else{
      return this.$promise.resolve(this.records);
    }
  }*/
  if (url && this.http){
    cached = this.addToCache(url);

    return this.http({url, method : 'get'})
      .then(response => {
        const result = [].concat(response.data);

        return this.$promise
          .all(result.map(row => this.add(row)))
          .then(() => {
            let records = this.records;
            let promises = cached.promises;
            cached.timestamp = Date.now();
            cached.promises = null;
            promises.forEach(p => p.resolve(records));
            return records;
          });
      })
      .catch(err => {
        let promises = cached.promises;
        cached.promises = null;
        promises.forEach(p => p.reject(err));
        throw err;
      });
  }else{
    return this.$promise.resolve(this.records);
  }
}

exports.getUrl = function (query) {
  var url = this.api.get && this.api.get.url;
  if (!url){
    return '';
  }
  return this.buildUrl(url, query, query);
};

exports.getOneUrl = function (query) {
  var url = this.api.getOne && this.api.getOne.url;
  if (!url){
    return '';
  }
  return this.buildUrl(url, query, query);
};

exports.getByIdUrl = function (id, params) {
  let url = this.api.getById && this.api.getById.url;
  if (!url){
    return '';
  }
  const query = Object.assign({}, params);
  query[this.primaryKey] = id;
  return this.buildUrl(url, query);
};

exports.fetch = function (query) {
  const url = this.getUrl(query);
  return this.queue(() => {
    return (function(){
      if (!url){
        return this.$promise.resolve(this.records);
      }else{
        return doFetch.call(this, url);
      }
    }.call(this))
      .then(results => this.filterResults(results, query));
  });
};

exports.fetchOne = function (query) {
  const url = this.getOneUrl(query);
  return (function(){
    if (!url){
      return this.fetch(query);
    }else{
      return this.queue(() => {
        return doFetch.call(this, url)
          .then(results => this.filterResults(results, query));
      });
    }
  }.call(this))
    .then(results => results.find(() => true));
};

exports.fetchById = function (id, params) {
  const idField = this.primaryKey;
  const query = {};
  query[idField] = id;
  const url = this.getByIdUrl(id, params);

  if (!url){
    return this.fetchOne(query);
  }else{
    return this.queue(() => {
      return doFetch.call(this, url)
        .then(results => this.filterResults(results, query))
        .then(results => results.find(() => true));
    });
  }
};
