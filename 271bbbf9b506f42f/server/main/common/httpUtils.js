'use strict';
var fetch = require('node-fetch');
var q = require('q');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var santaRoot = path.normalize(path.resolve(__dirname, __filename, '..', '..', '..', '..'));

function fixUrl(url) {
    return /^https?:\/\//.test(url) ? url : 'http://' + url;
}

function readFromLocalFilesystem(reqFlags, siteData) {
    return new Promise(function (resolve, reject) {
        console.log('readFromLocalFilesystem:', reqFlags.url);
        var filename = reqFlags.url.replace(siteData.santaBase, '').replace(/^\/+/, '');
        filename = path.resolve(santaRoot, filename);
        fs.readFile(filename, function (err, res) {
            if (err) {
                reject(err);
            }
            if (res) {
                res = JSON.parse(res);
            }
            resolve(res);
        });
    });
}

function readFromNetwork(reqFlags) {
    console.log('readFromNetwork', reqFlags.url);
    var reqOptions = {
        json: reqFlags.data ? reqFlags.data : null,
        method: reqFlags.data ? 'POST' : 'GET',
        headers: {
            'accept-encoding': 'gzip,deflate',
            'accept-charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2'
        }
    };
    var req = fetch(reqFlags.url, reqOptions);
    return req.then(function (res) {
        var contentType = res.headers.get('content-type');
        if (contentType.indexOf('application/json') === -1 && contentType.indexOf('application/javascript') === -1) {
            return res.text();
        }
        return res.json();
    });
}

/**
 * @param reqFlags
 * @param siteData
 * @return {*}
 */
function ajaxHarness(contextFunc, reqFlags) {
    var context = contextFunc();
    console.log('ajaxHarness', !!context);
    var deferred;
    var start = Date.now();
    reqFlags = _.assign({}, reqFlags, {url: fixUrl(reqFlags.url)});

    if (typeof reqFlags.success !== 'function' && typeof reqFlags.error !== 'function') {
        console.error('requestJSONWithEncoding');
        deferred = q.defer();
    }

    var resolveFunction = function (promise, err, value) {
        console.error('requestJSONWithEncoding:', reqFlags.url, (Date.now() - start));
        contextFunc(context);
        if (promise) {
            if (err) {
                console.log('err', err);
                promise.reject(err);
            } else {
                promise.resolve(value);
            }
        } else if (err) {
            if (reqFlags.error) {
                console.log('err', err);
                reqFlags.error(err);
            } else {
                reqFlags.success(null);
            }
        } else {
            reqFlags.success(value);
        }
    }.bind(this, deferred);

    var readerPromise = context.ajaxHandler(reqFlags, context);
    readerPromise.then(function (body) {
        resolveFunction(false, body);
    }).catch(function (err) {
        resolveFunction(err);
    });

    return deferred && deferred.promise;
}

function ajaxDefaultHandler(reqFlags, context) {
    const santaBase = _.get(context, 'model.santaBase');
    if (santaBase && reqFlags.url.indexOf(santaBase) === 0) {
        return readFromLocalFilesystem(reqFlags, context);
    }
    return readFromNetwork(reqFlags);
}

module.exports = {
    ajax: ajaxHarness.bind(null, () => {
        return {
            ajaxHandler: ajaxDefaultHandler
        };
    }),
    readFromLocalFilesystem,
    readFromNetwork,
    ajaxDefaultHandler,
    ajaxHarness
};
