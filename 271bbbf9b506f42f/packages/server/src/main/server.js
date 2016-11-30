define(['lodash', 'reactDOMServer', 'core', 'utils', 'components', 'wixappsCore', 'wixappsBuilder', 'wixappsClassics', 'tpa'], function (_, ReactDOMServer, /** core */ core, /** utils */ utils) {
    'use strict';

    function convertRendererModel(oldRendererModel, publicMdl) {
        return oldRendererModel.siteInfo ? oldRendererModel : {
            metaSiteId: oldRendererModel.metaSiteId,
            siteInfo: {
                applicationType: oldRendererModel.applicationType,
                documentType: oldRendererModel.documentType,
                siteId: oldRendererModel.siteId,
                siteTitleSEO: oldRendererModel.siteTitleSEO
            },
            clientSpecMap: oldRendererModel.clientSpecMap,
            premiumFeatures: oldRendererModel.premiumFeatures,
            geo: oldRendererModel.geo,
            languageCode: oldRendererModel.languageCode,
            previewMode: oldRendererModel.previewMode,
            userId: oldRendererModel.userId,
            siteMetaData: oldRendererModel.siteMetaData ? {
                contactInfo: oldRendererModel.siteMetaData.contactInfo,
                adaptiveMobileOn: publicMdl.adaptiveMobileOn || false,
                preloader: oldRendererModel.siteMetaData.preloader,
                quickActions: oldRendererModel.siteMetaData.quickActions
            } : undefined,
            runningExperiments: oldRendererModel.runningExperiments
        };
    }

    function getServerSideRenderingQueryFlags(requestUrl) {
        var req = requestUrl;
        if (_.isString(requestUrl)) {
            req = utils.urlUtils.parseUrl(requestUrl);
        }
        var ret = [];
        if (_.isString(req.query.sssr)) {
            ret = req.query.sssr.split(',');
        }
        return ret;
    }

    function getCustomJsData(requestUrl, siteData) {
        var ret = ['\n', '<script>'];
        var sssrQueryFlags = getServerSideRenderingQueryFlags(requestUrl);
        // pages data
        if (_.includes(sssrQueryFlags, 'pages')) {
            ret.push('var pagesData = ');
            ret.push(JSON.stringify(siteData.pagesData));
            ret.push(';');
        }
        // wixapps
        if ((_.includes(sssrQueryFlags, 'wixapps')) && siteData.wixapps && !_.isEmpty(siteData.wixapps)) {
            ret.push('var wixapps = ');
            ret.push(JSON.stringify(siteData.wixapps));
            ret.push(';');
        }
        // svg shapes
        if (_.includes(sssrQueryFlags, 'svg') && siteData.svgShapes && !_.isEmpty(siteData.svgShapes)) {
            ret.push('var svgShapes = ');
            ret.push(JSON.stringify(siteData.svgShapes));
            ret.push(';');
        }
        ret.push('</script>');
        return ret.join('\n');
    }

    function injectOptionalDependencies(query) {
        if (query.isqa === 'true') {
            var qaAutomation = requirejs('qaAutomation');
            qaAutomation.init();
        }
    }

    function renderServerSide(siteModel, fetchFunc, callback) {
        siteModel = typeof siteModel === 'string' ? JSON.parse(siteModel) : siteModel;

        injectOptionalDependencies(siteModel.requestModel.query);

        var externalBaseUrl = (siteModel.publicModel && siteModel.publicModel.externalBaseUrl) || '';
        siteModel.currentUrl = utils.urlUtils.parseUrl(externalBaseUrl);
        siteModel.currentUrl.search = siteModel.requestModel.search || '';
        siteModel.currentUrl.query = siteModel.requestModel.query || {};

        siteModel.clientSideRender = false;
        siteModel.serverAndClientRender = false;
        siteModel.rendererModel = convertRendererModel(siteModel.rendererModel, siteModel.publicModel);
        var siteData = new utils.SiteData(siteModel, fetchFunc);
        core.renderer.renderSite(siteData, function (renderedReact) {
            var siteAsString = ReactDOMServer.renderToString(renderedReact);

            // Delete cookie from the server payload, get them from the browser when the client is rendered
            delete siteModel.requestModel.cookie;

            var scriptTag = getCustomJsData(siteModel.currentUrl, renderedReact.props.siteData);
            callback(siteAsString + scriptTag);
        });
    }

    return {
        renderServerSide: renderServerSide
    };
});
