function doFetch(url) {
  if (!this.needsFetching(url)){
    let cached = this.getCache(url);
    if (cached.promises){
      return this.$promise((resolve, reject) => {
        cached.promises.push({resolve, reject});
      });
    }else if (cached.result){
      return this.$promise.resolve(cached.result);
    }
  }
  if (url && this.http){
    let cached = this.addToCache(url);

    return this.http({url, method : 'get'})
      .then(response => {
        cached.timestamp = Date.now();
        cached.result = [].concat(response.data);

        return this.$promise
          .all(cached.result.map(row => this.add(row)))
          .then(() => {
            let records = this.records;
            let promises = cached.promises;
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
  return this.$urlBuilder.buildUrl(url, null, query);
};

exports.getOneUrl = function (query) {
  var url = this.api.getOne && this.api.getOne.url;
  if (!url){
    return '';
  }
  return this.$urlBuilder.buildUrl(url, query, query);
};

exports.getByIdUrl = function (id) {
  var url = this.api.getById && this.api.getById.url;
  if (!url){
    return '';
  }
  var query = {};
  query[this.primaryKey] = id;
  return this.$urlBuilder.buildUrl(url, query);
};

exports.fetch = function (query) {
  const url = this.getUrl(query);
  return (function(){
    if (!url){
      return this.$promise.resolve(this.records);
    }else{
      return doFetch.call(this, url);
    }
  }.call(this))
    .then(results => this.filterResults(results, query));
};

exports.fetchOne = function (query) {
  const url = this.getOneUrl(query);

  return (function(){
    if (!url){
      return this.fetch(query);
    }else{
      return doFetch.call(this, url)
        .then(results => this.filterResults(results, query));
    }
  }.call(this))
    .then(results => results.find(() => true));
};

exports.fetchById = function (id) {
  const idField = this.primaryKey;
  const query = {};
  query[idField] = id;
  const url = this.getByIdUrl(id);

  if (!url){
    return this.fetchOne(query);
  }else{
    return doFetch.call(this, url)
      .then(results => this.filterResults(results, query))
      .then(results => results.find(() => true));
  }
};
