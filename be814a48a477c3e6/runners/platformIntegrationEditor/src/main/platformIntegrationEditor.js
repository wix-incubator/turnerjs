define([
    'lodash',
    'platformIntegrationEditor/utils/logger',
    'platformIntegrationEditor/bootstrap',
    'platformIntegrationEditor/drivers/editorDriver',
    'platformIntegrationEditor/drivers/platformDriver'
], function (_, logger, bootstrap, editorDriver, platformDriver) {
    'use strict'

    function init(window, platform) {
        var runner = getRunnerNameFromUrlQuery(window.location.search)

        onDocumentServicesLoaded(window, function () {
            editorDriver.init(window)
            platformDriver.init(platform, window)
            bootstrap.run(window, runner)
        })
    }

    function getRunnerNameFromUrlQuery(search) {
        var specMatch = /[?&]jasminespec=([^&]+)/i.exec(search)
        if (_.isUndefined(specMatch) || _.isNull(specMatch)) {
            logger.warn('Invalid format of the "jasmineSpec" query parameter. Expected: package:name')
            return
        }

        var specParamParts = decodeURIComponent(specMatch[1]).split(':')
        if (specParamParts.length !== 2) {
            logger.warn('Invalid format of the "jasmineSpec" query parameter. Expected: package:name')
            return
        }

        var specArtifact = specParamParts[0]
        var specName = specParamParts[1]
        return specArtifact + specName + '.spec'
    }

    function onDocumentServicesLoaded(window, cb) {
        function onMessage(event) {
            if (event.data === 'documentServicesLoaded') cb()
        }

        var previewNode = window.document.getElementById('preview')
        try {
            if (_.get(previewNode, 'contentWindow.documentServices')) {
                cb()
            } else {
                window.addEventListener('message', onMessage)
            }
        } catch (err) {
            window.addEventListener('message', onMessage)
        }
    }

    return {
        init: init
    }
})
