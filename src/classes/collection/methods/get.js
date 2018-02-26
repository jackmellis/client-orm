exports.get = function (query) {
  const url = this.getUrl(query);
  if (this.needsFetching(url)){
    this.fetch(query);
  }
  return this.filterResults(this.records, query);
};

exports.getOne = function (query) {
  const url = this.getOneUrl(query);
  if (this.needsFetching(url)){
    this.fetchOne(query);
  }
  return this.filterResults(this.records, query).find(() => true);
};

exports.getById = function (id, params) {
  if (id === undefined){
    throw new Error('getById must be called with an id');
  }

  const query = {};
  query[this.primaryKey] = id;
  const url = this.getByIdUrl(id, params);
  if (this.needsFetching(url)){
    this.fetchById(id);
  }
  return this.filterResults(this.records, query).find(() => true);
};
