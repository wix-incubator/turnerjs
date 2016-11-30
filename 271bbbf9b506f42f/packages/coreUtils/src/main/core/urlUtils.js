/**
 * Created by eitanr on 6/12/14.
 */
define(['lodash', 'coreUtils/core/stringUtils'], function (_, stringUtils) {
    'use strict';
    function addProtocolIfMissing(url) {
        var beginsWithProtocol = /^(ftps|ftp|http|https):.*$/.test(url),
            beginsWithDoubleSlash = /^\/\//.test(url);

        if (beginsWithProtocol) {
            return url;
        }
        if (beginsWithDoubleSlash) {
            return 'http:' + url;
        }

        return 'http://' + url;
    }

    function toQueryString(jsonObj, convertBool) {
        return _.map(jsonObj, function (value, key) {
            return toQueryParam(key, value, convertBool);
        }).sort().join('&');
    }

    function toQueryParam(key, val, convertBool) {
        key = encodeURIComponent(key);
        if (!val && val !== 0 && val !== false) {
            return key;
        }
        key += '=';
        if (_.isArray(val)) {
            return _.map(val, function (innerVal) {
                return key + encodeURIComponent(innerVal);
            }).join('&');
        }
        if (convertBool && typeof val === 'boolean') {
            val = val ? '1' : '0';
        } else {
            val = encodeURIComponent(val);
        }
        return key + val;
    }

    function baseUrl(url) {
        var parsed = parseUrl(url);
        return parsed.protocol + '//' + parsed.host;
    }

    function getPath(url) {
        var parsed = parseUrl(url);
        return parsed.path;
    }

    function getBaseUrlWithPath(urlObj, pathPartsCount) {
        var path = urlObj.path || urlObj.pathname || '';
        var pathParts = path.split('/');
        var pathPartsToUse = _.compact(pathParts.slice(0, (pathPartsCount || 0) + 1));
        var url = urlObj.protocol + '//' + urlObj.hostname;
        if (!_.isEmpty(pathPartsToUse)) {
            url += '/' + pathPartsToUse.join('/');
        }
        return url;
    }

    var uniqueCounter = 0;

    function cacheKiller() {
        return new Date().getTime().toString() + uniqueCounter++;
    }

    function resetCacheKiller() {
        uniqueCounter = 0;
    }

    var urlRe = /((https?\:)\/\/)?([^\?\:\/#]+)(\:([0-9]+))?(\/[^\?\#]*)?(\?([^#]*))?(#.*)?/i;
    function parseUrl(url) {
        if (!url) {
            return {};
        }

        var match = url.match(urlRe);
        var port = match[5] || '';
        var search = match[8] ? ('?' + match[8]) : '';
        var ret = {
            full: url,
            protocol: match[2] || 'http:',
            host: match[3] + (port ? (':' + port) : ''),
            hostname: match[3],
            port: port,
            path: match[6] || '/',
            search: search,
            hash: match[9] || ''
        };

        // fix empty hash
        if (ret.hash === '#' || ret.hash === '#!') {
            ret.hash = '';
        }

        ret.query = parseUrlParams(match[8]);
        return ret;
    }

    function parseUrlParams(queryString) {
        var re = /([^&=]+)=([^&]*)/g;
        var param, query = {};

        while ((param = re.exec(queryString)) !== null) {
            var key = decodeURIComponent(param[1]);
            var val = decodeURIComponent(param[2]);
            if (!query[key]) {
                // first value for key, keep as string
                query[key] = val;
            } else if (_.isArray(query[key])) {
                // more than one value already, push to the array
                query[key].push(val);
            } else {
                // the 2nd value for the key, turn into an array
                query[key] = [query[key], val];
            }
        }

        return query;
    }

    function setUrlParam(url, paramName, value) {
        var urlParts = url.split("?");
        var paramList = [];
        var replaced = false;
        if (urlParts.length > 1) {
            paramList = urlParts[1].split("&");
            var paramIndex = _.findIndex(paramList, function(param) {
                return stringUtils.startsWith(param, paramName + "=");
            });
            if (paramIndex !== -1) {
                paramList[paramIndex] = paramName + '=' + String(value);
                replaced = true;
            }
        }

        if (!replaced) {
            paramList.push(paramName + "=" + String(value));
        }

        urlParts[1] = paramList.join("&");
        url = urlParts.join("?");
        return url;
    }

    function removeUrlParam(url, paramName) {
        var urlObj = parseUrl(url);
        delete urlObj.search;
        if (urlObj.query) {
            delete urlObj.query[paramName];
        }

        return buildFullUrl(urlObj);
    }

    function setUrlParams(url, params) {
        var urlObj = parseUrl(url);
        _.assign(urlObj.query, params);
        return buildFullUrl(urlObj, true);
    }

    function buildFullUrl(urlObj, ignoreSearch) {
        var search = ignoreSearch ? null : urlObj.search;
        if (search) {
            search = search.replace(/^[?]/, '');
        }

        var query = (search || toQueryString(urlObj.query || {}));

        if (query) {
            var queryPrefix = _.includes(urlObj.path, '?') ? '&' : '?';
            query = queryPrefix + query;
        }

        return (isLocalUrl(urlObj.full)) ? urlObj.full : urlObj.protocol + '//' +
                urlObj.hostname + (urlObj.port ? ':' + urlObj.port : '') +
                urlObj.path +
                (query || '') +
                urlObj.hash;
    }

    function isExternalUrl(url) {
        return (/(^https?)|(^data)|(^blob)|(^\/\/)/).test(url);
    }

    function isRelativeUrl(url) {
        return (/^\/(.*)/).test(url);
    }

    function isLocalUrl(url) {
        return (/(^data)|(^blob)/).test(url);
    }

    function isUrlEmptyOrNone(url) {
        return (!url || !url.trim() || url.toLowerCase() === 'none');
    }

    function isSameUrl(url1, url2) {
        function simplifyUrl(url) {
            return url && url.replace(/[?&#/]+$/, '').toLowerCase();
        }
        return simplifyUrl(url1) === simplifyUrl(url2);
    }

    function joinURL() {
        /*eslint strict:0 */
        var url = arguments[0];
        for (var i = 1; i < arguments.length; ++i) {
            url = url.replace(/\/$/, '') + '/' + arguments[i].replace(/^\//, '');
        }
        return url;
    }

    function updateUrl(url) {
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, '', url);
        } else {
            console.error('window.history is not supported in this OLD browser!'); // eslint-disable-line no-console
            //Not supported only in IE9
        }
    }

    /**
     * builds URL and path by querying the image uri
     * @param imageUri
     * @param staticMediaUrl
     * @param mediaRootUrl
     * @returns {string}
     */
    function getMediaUrlByContext(imageUri, staticMediaUrl, mediaRootUrl) {
        if (isExternalUrl(imageUri)) {
            return imageUri;
        }
        var path = staticMediaUrl + '/';
        if (imageUri) {
            if (/^micons\//.test(imageUri)) {
                path = mediaRootUrl;
            } else if (/[^.]+$/.exec(imageUri)[0] === 'ico') {
                //if the image is an icon then it's taken from a slightly different place
                path = path.replace('media', 'ficons');
            }
        }
        return path + imageUri;
    }

    /**
     * checks if query param is present in parsed URL
     * @param urlObj
     * @param queryParam
     * @returns {boolean}
     */
    function isQueryParamOn(urlObj, queryParam) {
        return _.has(urlObj.query, queryParam) && urlObj.query[queryParam] !== 'false';
    }

    /**
     * returns true if the url has the param and it's value equals true
     * @param {string} name
     * @param {string?} urlQueries
     * @return {boolean}
     */
    function isTrue(name, urlQueries) {
        return getParameterByName(name, urlQueries) === 'true';
    }

    /**
     * A cross browser solution for window.location.origin for IE
     * @return {string}
     */
    function origin() {
        if (window.location.origin) { //eslint-disable-line santa/no-window-location-origin
            return window.location.origin; //eslint-disable-line santa/no-window-location-origin
        }
        var port = window.location.port ? ':' + window.location.port : '';
        return window.location.protocol + "//" + window.location.hostname + port;
    }

    // https://yandex.ru/support/metrika/general/counter-webvisor.xml
    function isHostnameYandexWebvisor(hostname) {
        return /^(.*\.)?mtproxy\.yandex\.net$/.test(hostname);
    }

    function getParameterByName(name, urlQueries) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)', 'i'),
            results = regex.exec(urlQueries || window.location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    return {
        addProtocolIfMissing: addProtocolIfMissing,
        toQueryString: toQueryString,
        toQueryParam: toQueryParam,
        baseUrl: baseUrl,
        getPath: getPath,
        cacheKiller: cacheKiller,
        resetCacheKiller: resetCacheKiller,
        removeUrlParam: removeUrlParam,
        setUrlParam: setUrlParam,
        setUrlParams: setUrlParams,
        isExternalUrl: isExternalUrl,
        isRelativeUrl: isRelativeUrl,
        isUrlEmptyOrNone: isUrlEmptyOrNone,
        updateUrl: updateUrl,

        /**
         * @typedef {object} ParseUrlReturnType
         * @property {string} full The whole URL that was passed
         * @property {string} protocol The protocol (http: or https:)
         * @property {string} host The host of the URL, including port
         * @property {string} hostname The host name of the URL, not including port
         * @property {string} port The port, or empty string
         * @property {string} path The path after the host
         * @property {object} query The query string as object containing string keys, and values will be the following:
         *  string, if there's one param
         *  array, if there's more than one value for the params
         * @property {string} search The full search string, including the question mark
         * @property {string} hash The hash that was passed, including the hash sign or empty string
         */


        /**
         * Parses a URL and returns an object with sliced down parameters
         * @returns {ParseUrlReturnType} The parsed object
         */
        parseUrl: parseUrl,
        parseUrlParams: parseUrlParams,
        buildFullUrl: buildFullUrl,

        isQueryParamOn: isQueryParamOn,
        isTrue: isTrue,

        isSame: isSameUrl,
        joinURL: joinURL,
        getMediaUrlByContext: getMediaUrlByContext,
        origin: origin,
        getBaseUrlWithPath: getBaseUrlWithPath,
        getParameterByName: getParameterByName,
        isHostnameYandexWebvisor: isHostnameYandexWebvisor
    };
});
