'use strict';
/**
 * santa express server
 */
const program = require('commander');
const compression = require('compression');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const root = path.resolve(__dirname, '..', '..', '..');
const bodyParser = require('body-parser');
const santaUtils = require('santa-utils');
const hot = require('./watcher');
const _ = require('lodash');
const pkg = require('../../../package.json');
const requests = require('request');
const gitHelper = require('./gitHelper');
const deviceProxy = require('./deviceProxy');

const SANTA_EDITOR_BASE = getEditorBase();
const WIXCODE_SDK_BASE = getWixCodeSDKBase();

function getSSLCredentials() {
    try {
        return {
            cert: fs.readFileSync(path.join(__dirname, 'sslcert', 'cert.pem')),
            key: fs.readFileSync(path.join(__dirname, 'sslcert', 'key.pem')),
            passphrase: 'wixpress'
        };
    } catch (err) {
        console.log(err);
        console.log('SSL certificate not found. Verify it is in ${SantaRoot}/server/main/dev/sslcert folder.');
    }
}

function getEditorBase() {
    try {
        return path.resolve(santaUtils.getProjectPath('Santa-Editor'));
    } catch (err) {
        console.log(err);
        console.log('Editor location not defined in your .santa file. local editor will not work.');
    }
}

function getWixCodeSDKBase() {
    try {
        return path.resolve(santaUtils.getProjectPath('wixcode-sdk'));
    } catch (err) {
        //TODO
    }
}

function serveLocalfiles(app) {
    const mapStatic = p => express.static(path.join(root, p));
    app.use(mapStatic('static'));

    const staticMappings = {
        '/app': 'app',
        '//app': 'app', //TODO fix when https://jira.wixpress.com/browse/HTMLSRVR-671 is resolved
        '/packages': 'packages',
        '/packages-bin': 'target/packages-bin',
        '/static': 'static',
        '//static': 'static', //TODO fix when https://jira.wixpress.com/browse/HTMLSRVR-671 is resolved
        '/galleries': 'node_modules/santa-galleries',
        '/lib': 'lib',
        '/js': 'js',
        '/target': 'target',
        '/cssCache': 'cssCache',
        '//versions': 'target/versions',
        '/versions': 'target/versions',
        '/node_modules': 'node_modules',
        '//node_modules': 'node_modules'
    };

    _.forEach(staticMappings, (v, k) => {
        app.use(k, mapStatic(v));
    });

    if (SANTA_EDITOR_BASE) {
        app.use('/editor-base/packages-bin', express.static(path.resolve(SANTA_EDITOR_BASE, 'target', 'packages-bin')));
        app.use('/editor-base', express.static(path.resolve(SANTA_EDITOR_BASE)));
        if (WIXCODE_SDK_BASE) {
            app.use('/wixcode-sdk', express.static(path.resolve(WIXCODE_SDK_BASE)));
        }
    }
}

function start() {
    const app = express();

    program
        .version(pkg.version)
        .option('-s, --ssl', 'Serve over SSL (Port 443)')
        .parse(process.argv);

    deviceProxy.init(app);

    app.use(compression());
    app.use(bodyParser.json());


    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    app.get('/proxy', (req, res) => {
        requests.get(req.query.src).pipe(res);
    });

    app.get('/modifiedPackages', (req, res) => {
        const viewerModifiedPackages = gitHelper.getModifiedPackages(root);
        const editorModifiedPackages = gitHelper.getModifiedPackages(SANTA_EDITOR_BASE);
        const mergedModifiedPackages = Object.assign(viewerModifiedPackages, editorModifiedPackages);

        res.json(Object.keys(mergedModifiedPackages));
    });

    const server = program.ssl ? https.createServer(getSSLCredentials(), app) : http.createServer(app);

    serveLocalfiles(app);

    hot.start(server, SANTA_EDITOR_BASE);
    // Start listening on port 80, or 443 (HTTPS default)
    server.listen(program.ssl ? 443 : 80, () => { console.log(`Listening on ip localhost:${server.address().port}`); });
}

module.exports = {start, serveLocalfiles};
