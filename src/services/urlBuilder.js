var Base = require('../classes/base');

Base.register.service('$urlBuilder', [], function () {
  this.buildUrl = function (url, params, query) {
    if (params){
      url = this.buildParams(url, params);
    }
    if (query){
      url = this.buildQuery(url, query);
    }
    return url;
  };
  this.buildParams = function (url, params) {
    if (!params || url.indexOf('{') < 0){
      return url;
    }
    Object.keys(params).forEach(key => {
      const value = params[key];
      const needle = '{' + key + '}';
      url = url.replace(needle, () => value);
    });
    return url;
  };
  this.buildQuery = function (url, query) {
    if (!query){
      return url;
    }
    let oper = '?';
    if (url.indexOf('?') > -1){
      oper = '&';
    }
    return url + oper + Object.keys(query).map(key => {
      const value = query[key];
      const isArray = Array.isArray(value);

      const left = encodeURIComponent(key);
      const oper = isArray ? '[]=' : '=';
      const right = isArray ? value : [value];

      return right.map(value => left + oper + encodeURIComponent(value)).join('&');
    }).join('&');
  };
}).lifecycle.application();
