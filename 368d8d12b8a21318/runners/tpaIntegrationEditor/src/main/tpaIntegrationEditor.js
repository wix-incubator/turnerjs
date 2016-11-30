define([
    'lodash',
    'jquery',
    'tpaIntegrationEditor/bootstrap/bootstrap',
    'tpaIntegrationEditor/driver/driver'
], function (_, $, bootstrap, driver) {
    'use strict';

    var _global, _specArtifact, _specName, _tpa, _util, _savePublish, _panels;
    var init = function (global, tpa, util, savePublish, panels) {
        _global = global;
        _tpa = tpa;
        _util = util;
        _savePublish = savePublish;
        _panels = panels;
        var specMatch = /[?&]jasminespec=([^&]+)/i.exec(_global.location.search);
        if (_.isUndefined(specMatch) || _.isNull(specMatch)) {
            console.log('Invalid format of the "jasmineSpec" query parameter. Expected: package:name');
            return;
        }
        var specParam = decodeURIComponent(specMatch[1]);
        var specParamParts = specParam.split(':');
        if (specParamParts.length !== 2) {
            console.log('Invalid format of the "jasmineSpec" query parameter. Expected: package:name');
            return;
        }

        _specArtifact = specParamParts[0];
        _specName = specParamParts[1];

        var previewNode = $('iframe')[0];
        try {
            if (_.get(previewNode, 'contentWindow.documentServices')) {
                onPreviewReady();
            } else {
                window.addEventListener('message', onMessage);
            }
        } catch (e) {
            window.addEventListener('message', onMessage);
        }
    };

    var onMessage = function (event) {
        if (event.data === 'documentServicesLoaded') {
            onPreviewReady();
        }
    };

    var onPreviewReady = function () {
        var runner = _specArtifact + _specName + '.spec';
        driver.init(_tpa, _util, _savePublish, _panels);
        bootstrap.run(_global, runner);
    };

    return {
        init: init
    };
});
