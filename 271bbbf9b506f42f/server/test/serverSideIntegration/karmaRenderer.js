/**
 * Created by avim on 21/10/2016.
 */
'use strict';
const express = require('express');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const reactDOM = require('react-dom/server');
const varStringify = require('../../main/common/var-stringify');

const santaBasePath = path.resolve(__dirname, '../../../');
const beakerSitesPath = path.resolve(santaBasePath, 'beaker', 'sites');
const serveLocalfiles = require('../../main/dev/server').serveLocalfiles;

const santaRequire = require('../../main/common/node-santa-require')({context: 'KARMA_RENDERER'});
const render = require('../../main/render')(santaRequire);

const defaultOptions = {
    santaBase: 'http://localhost',
    debug: false
};

function buildSiteModel(options, siteName) {
    const siteModel = JSON.parse(fs.readFileSync(path.resolve(beakerSitesPath, `${siteName}.json`)).toString());
    siteModel.pagesData = {
        masterPage: siteModel.siteAsJson.masterPage
    };
    _.forEach(siteModel.siteAsJson.pages, page => {
        siteModel.pagesData[page.structure.id] = page;
    });
    var currentUrl = `${siteModel.publicModel.externalBaseUrl}${options.debug ? '?debug=all' : ''}`;
    siteModel.serviceTopology.scriptsLocationMap.santa = options.santaBase;
    _.assign(siteModel, {
        requestModel: {
            userAgent: 'Some chrome thingy',
            cookie: '',
            storage: {}
        },
        currentUrl: currentUrl,
        rawUrl: currentUrl
    });
    return siteModel;
}

function renderTemplate(options, siteModel, html) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" type="text/css" href="${options.santaBase}/static/css/viewer.css">
    <script src="${options.santaBase}/node_modules/requirejs/require.js"></script>
    <script>
${varStringify(_.pick(siteModel, ['adData', 'mobileAdData', 'rendererModel', 'serviceTopology', 'publicModel', 'pagesData']))}
${varStringify({serverSideUrl: siteModel.rawUrl, clientSideRender: !html, santaBase: options.santaBase})}
    </script>
    <script src="${options.santaBase}/app/main-r.min.js"></script>

</head>
<body>
    <div id="SITE_CONTAINER">${html}</div>
</body>
</html>`;
}

function karmaRenderer(app, logger, options) {
    options = _.assign({}, defaultOptions, options || {});
    serveLocalfiles(app);
    // main code
    app.get('/render/:siteName/', function (req, res) {
        const siteName = req.params.siteName;
        const siteModel = buildSiteModel(options, siteName);
        render(siteModel, (site) => {
            const html = reactDOM.renderToString(site);
            res.end(renderTemplate(options, siteModel, html));
        });

    });
}

if (require.main === module) {
    const app = express();
    const port = 3000;
    karmaRenderer(app, console);
    app.listen(port);
    console.log(`karmaRenderer listening on port ${port}`);
    console.log(JSON.stringify(defaultOptions, null, 2));
}

module.exports = karmaRenderer;
