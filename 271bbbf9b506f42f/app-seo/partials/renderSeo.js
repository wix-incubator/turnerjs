function prepareRenderSeo(config,
                          packageLoader,
                          queryUtil,
                          joinURL,
                          addExperimentsFromQuery,
                          convertSiteModel,
                          serviceTopology,
                          cookie,
                          window) {

    function updateRunningExperiments(rendererModel) {
        rendererModel.runningExperiments = addExperimentsFromQuery(rendererModel.runningExperiments, queryUtil, 'viewer');
    }

    function buildSiteModel(publicModel, rendererModel, utils, currentUrl) {
        var siteModel = convertSiteModel(rendererModel, publicModel);
        window.siteModel = siteModel;
        siteModel.currentUrl = utils.urlUtils.parseUrl(currentUrl);
        siteModel.requestModel = {
            userAgent: window.navigator.userAgent,
            cookie: cookie,
            storage: utils.storage(window)
        };
        siteModel.santaBase = config.baseUrl;

        var semverMatches = siteModel.santaBase.match(/\/(\d+\.\d+\.\d+)\/?$/);
        siteModel.baseVersion = semverMatches && semverMatches[1];
        siteModel.santaBaseFallbackUrl = siteModel.baseVersion ? joinURL(serviceTopology.staticServerFallbackUrl, siteModel.baseVersion) : null;

        return siteModel;
    }

    function validateParams(publicModel, rendererModel, currentUrl) {
        if (!publicModel) {
            throw new TypeError('Public model not provided');
        }

        if (!rendererModel) {
            throw new TypeError('Renderer model not provided');
        }

        if (!currentUrl) {
            throw new TypeError('Current URL not provided');
        }
    }

    function renderSeo(ajaxHandler, wixCodeInit, wixCodeSeo, utils) {
        var publicModel = window.publicModel;
        var rendererModel = window.rendererModel;
        var currentUrl = window.currentUrl;

        validateParams(publicModel, rendererModel, currentUrl);

        updateRunningExperiments(rendererModel);

        var wixCodeAppApi = wixCodeInit.getAppApi();

        var siteModel = buildSiteModel(publicModel, rendererModel, utils, currentUrl);

        wixCodeInit.initMainR(wixCodeAppApi, siteModel, false, queryUtil);
        wixCodeSeo.renderSeo(ajaxHandler, siteModel, {
            wixCodeAppApi: wixCodeAppApi
        });
    }

    function prefetchPackages() {
        var seoPackages = ['wixCodeInit', 'utils', 'wixUrlParser', 'core', 'lodash', 'zepto', 'widgets', 'experiment', 'wixCode', 'wixCodeSeo'];

        packageLoader(config, seoPackages, function(loadedPackages, ajaxHandler) {
            var utils = loadedPackages.utils;
            var wixCodeSeo = loadedPackages.wixCodeSeo;
            var wixCodeInit = loadedPackages.wixCodeInit;

            window.renderSeo = renderSeo.bind(this, ajaxHandler, wixCodeInit, wixCodeSeo, utils);
        });
    }

    prefetchPackages();
}

define([], function() { return prepareRenderSeo; }); //THIS LINE WILL BE REMOVED DURING CONCAT
