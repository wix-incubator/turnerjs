'use strict';

const path = '/services/santa/0.0.0';
const proxiedHost = 'static.parastorage.com';
const prefix = `http://${proxiedHost}${path}`;
const http = require('http');

function init(app) {
    app.get('/dev-proxy.pac', (req, res) => {
        res.writeHead(200);
        res.write(`
            function FindProxyForURL(url, host) {
                if (host === '${proxiedHost}' && url.substr(0, 5) === 'http:')
                    return 'PROXY ${req.headers.host}';
                else
                    return 'DIRECT';
            }`);
        res.end();
    });

    app.use(function (req, res, next) {
        if (req.headers.host !== proxiedHost) {
            next();
            return;
        }

        const shouldRewrite = req.url.indexOf(prefix) === 0;
        const headers = req.headers;
        if (shouldRewrite) {
            headers.host = 'localhost';
        }

        const proxyRequest = http.request({
            host: shouldRewrite ? 'localhost' : proxiedHost,
            method: 'GET',
            path: shouldRewrite ? req.url.substr(prefix.length) : req.url,
            headers: headers
        });

        proxyRequest.addListener('response', proxyResponse => {
            proxyResponse.addListener('data', chunk => res.write(chunk, 'binary'));
            proxyResponse.addListener('end', res.end.bind(res));
            res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        });
        req.addListener('data', chunk => proxyRequest.write(chunk, 'binary'));
        req.addListener('end', proxyRequest.end.bind(proxyRequest));
    });
}

module.exports = {init};
