'use strict';

var queryMap;
var window = require('./window');

function _buildQueryMap() {
  queryMap = parseUrlParams(window.location.search.substring(1));
}

function getQueryParameter(parameterName) {
  if (!queryMap) {
    _buildQueryMap();
  }

  return queryMap[parameterName] || null;
}

function pickQueryParameters() {
  if (!queryMap) {
    _buildQueryMap();
  }

  var params = Array.prototype.slice.call(arguments);

  function toParameterNameValue(result, param) {
    result[param] = getQueryParameter(param);
    return result;
  }

  return params.reduce(toParameterNameValue, {});
}

function getParametersAsString(queryObject) {
  function toParameterNameValue(name) {
    return name + '=' + queryObject[name];

  }

  return Object.keys(queryObject).map(toParameterNameValue).join('&');
}

function joinURL() {
  /*eslint-disable santa/no-for-loop */
  var url = arguments[0];
  for (var i = 1; i < arguments.length; ++i) {
    url = url.replace(/\/$/, '') + '/' + arguments[i].replace(/^[\/]*/, '');
  }
  return url;
}

function parseUrlParams(queryString) {
  var re = /([^&=]+)=?([^&]*)/g;
  var param;
  var query = {};

  while ((param = re.exec(queryString)) !== null) {
    var key = decodeURIComponent(param[1]);
    var val = decodeURIComponent(param[2]);
    if (!query[key]) {
      // first value for key, keep as string
      query[key] = val;
    } else if (Array.isArray(query[key])) {
      // more than one value already, push to the array
      query[key].push(val);
    } else {
      // the 2nd value for the key, turn into an array
      query[key] = [query[key], val];
    }
  }

  return query;
}

function getQueryParamsFromUrl(url) {
  var startQuery = url.indexOf('?');
  if (startQuery === -1) {
    return {};
  }

  var queryString = url.substring(startQuery + 1);
  if (queryString.indexOf('#!') !== -1) {
    queryString = queryString.substring(0, queryString.indexOf('#!'));
  }

  return parseUrlParams(queryString);
}

module.exports = {
  getQueryParameter: getQueryParameter,
  getParametersAsString: getParametersAsString,
  pickQueryParameters: pickQueryParameters,
  getQueryParamsFromUrl: getQueryParamsFromUrl,
  joinURL: joinURL
};
