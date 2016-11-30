'use strict';
const chokidar = require('chokidar');
const _ = require('lodash');
const path = require('path');
const packagesUtils = require('requirejs-packages').packagesUtils;

function start(server, editorPath) {
    const io = require('socket.io')(server);
    io.on('connection', socket => {
        startConnection(socket, editorPath);
    });
}

function startConnection(socket, editorPath) {
    const editorPkgs = path.resolve(editorPath, 'packages');
    const editorCss = path.resolve(editorPath, 'cssCache/packages/rEditor/src/main/editor.css');
    const mappings = {
        'packages/**/*.js': {type: 'js', root: 'packages'},
        'static/css/viewer.css': {type: 'css', root: 'packages'},
        [editorPkgs]: {type: 'js', root: editorPkgs},
        [editorCss]: {type: 'css', root: editorPkgs}
    };
    startWatch(socket, mappings);
}

function startWatch(socket, mappings) {
    _.forEach(mappings, (evt, pattern) => {
        // console.log('watching', pattern, evt.type, evt.root);
        chokidar.watch(pattern, {ignored: /[\/\\]\./, ignoreInitial: true}).on('all', (event, filePath) => {
            var m = packagesUtils.pathToModule(evt.root, 'src/main', filePath);
            // console.log('watch', filePath, m);
            socket.emit(evt.type, {path: m});
        });
    });
}

module.exports = {start};
