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
    const keys = Object.keys(params);
    for (let x = 0, l = keys.length; x < l && url.indexOf('{') >= 0; x++){
      let key = keys[x];
      let value = params[key];
      let needle = '{' + key + '}';
      url = url.replace(needle, () => value);
    }
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
    return url + oper + Object.keys(query).map((key, index) => {
      const value = query[key];
      const isArray = Array.isArray(value);

      const left = encodeURIComponent(key);
      const oper = isArray ? '[' + index + ']=' : '=';
      const right = isArray ? value : [value];

      return right.map(value => left + oper + encodeURIComponent(value)).join('&');
    }).join('&');
  };
}).lifecycle.application();
