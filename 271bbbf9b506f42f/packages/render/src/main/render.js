define(['lodash', 'utils', 'core'], function (_, utils, core) {
    'use strict';

    var performanceNow = (typeof window !== 'undefined' && window.performance && window.performance.now) ? window.performance.now.bind(window.performance) : Date.now.bind(Date); //eslint-disable-line no-undef

    function getDSConfig(configs, currentUrl) {
        var urlParams = currentUrl.query;
        var configName = urlParams.configName || 'fullFunctionality';
        var config = configs[configName] || configs.fullFunctionality;
        var activeConfig = config.getConfig();

        if (!urlParams.dsOrigin) {
            throw new Error('You must define dsOrigin parameter in order to use the documentServices - please speak to html-server team for a key');
        }
        activeConfig.origin = urlParams.dsOrigin;
        return activeConfig;
    }

    function fixPages(siteModel, isServerSideRender, pagesData) {
        var pageIds = _(pagesData).keys().pull('masterPage').value();
        return _.mapValues(pagesData, function (data, pageId) {
            if (isServerSideRender && window.pagesData && window.pagesData[pageId]) {
                // don't fix pages that were rendered in the server and already fixed there
                return data;
            }
            return utils.dataFixer.fix(data, pageIds.slice(), siteModel.requestModel, siteModel.currentUrl, siteModel.urlFormatModel);
        });
    }

    function buildRenderedSite(conditionalPackages, siteData, viewerPrivateServices, props, onSiteReady) {
        core.renderer.renderSite(siteData, viewerPrivateServices, props, function (renderedReact) {
            if (window.rendered) {
                window.rendered.forceUpdate();
            } else {
                var a = window.document.getElementById("SITE_CONTAINER").children[0];
                window.rendered = conditionalPackages.reactDOM.render(renderedReact, window.document.getElementById("SITE_CONTAINER"));
                var b = window.document.getElementById("SITE_CONTAINER").children[0];

                if (window.sssr) {
                    window.sssr.success = (a === b);
                    window.sssr.clientSideRender = {
                        sinceInitialTimestamp: (Date.now() - window.wixBiSession.initialTimestamp),
                        performanceNow: performanceNow()
                    };
                }

                window.onpopstate = window.rendered.onPopState;
                window.onhashchange = window.rendered.onHashChange;

                if (window.parent) {
                    window.rendered.registerAspectToEvent('siteReady', function () {
                        if (onSiteReady) {
                            onSiteReady(window.rendered);
                        }
                        if (window.documentServices) {
                            window.parent.postMessage('documentServicesLoaded', '*');
                        }
                    });
                }
                if (conditionalPackages.qaAutomation) {
                    _.set(window, 'testApi.domSelectors', conditionalPackages.qaAutomation.getDomSelectors(conditionalPackages.react, conditionalPackages.reactDOM));
                    window.testApi.domSelectors.setSearchRoot(window.rendered);
                    _.set(window, 'testApi.isReady', true);
                }
            }
        });
    }

    function createSitePrivates(conditionalPackages, ajaxHandler, siteModel) {
        var renderOptions = {};
        if (utils.urlUtils.isQueryParamOn(siteModel.currentUrl, 'isSantaEditor')) {
            renderOptions = _.assign(renderOptions, {
                componentViewMode: 'editor'
            });
        }

        if (utils.urlUtils.isQueryParamOn(siteModel.currentUrl, 'isExternalPreview')) {
            renderOptions = _.assign(renderOptions, {
                isSocialInteractionAllowed: false
            });
        }

        siteModel.renderFlags = _.assign({}, siteModel.renderFlags, renderOptions);

        var fullSiteData = new utils.SiteData(siteModel);
        var siteDataWrapper = core.SiteDataAPI.createSiteDataAPIAndDal(fullSiteData, ajaxHandler);
        var displayedSiteData = siteDataWrapper.siteData;
        var siteDataAPI = siteDataWrapper.siteDataAPI;
        var viewerPrivateServices = {
            pointers: siteDataWrapper.pointers,
            displayedDAL: siteDataWrapper.displayedDal,
            siteDataAPI: siteDataAPI
        };
        var isServerSideRender = false;

        return {
            fullSiteData: fullSiteData,
            displayedSiteData: displayedSiteData,
            siteDataWrapper: siteDataWrapper,
            viewerPrivateServices: viewerPrivateServices,
            isServerSideRender: isServerSideRender,
            siteModel: siteModel,
            siteDataAPI: siteDataAPI
        };
    }

    function renderServerSide(conditionalPackages, ajaxHandler, siteModel, onReady) {
        onReady = onReady || conditionalPackages.lodash.noop;
        var privates = createSitePrivates(conditionalPackages, ajaxHandler, siteModel);

        function getDomNode() {
            var args = _.toArray(arguments);
            var domId = args.join('');
            var node = window.document.getElementById(domId);
            if (!node) {
                var compId = args[0];
                var altDomId = args.slice(1).map(function (subId) {
                    return subId.replace(compId, "");
                }).join('');
                node = window.document.getElementById(compId + altDomId);
            }

            return node;
        }

        var siteData = privates.displayedSiteData;
        var navInfo = utils.wixUrlParser.parseUrl(siteData, siteData.currentUrl.full);
        var currentPage = navInfo.pageId;
        privates.viewerPrivateServices.siteDataAPI.loadPage(navInfo, function () {
            var structuresDesc = {
                inner: {
                    structure: siteData.pagesData[currentPage].structure,
                    pageId: currentPage,
                    getDomNodeFunc: getDomNode
                },
                outer: {
                    structure: siteData.pagesData.masterPage.structure,
                    pageId: 'masterPage',
                    getDomNodeFunc: getDomNode
                }
            };
            conditionalPackages.layout.reLayout(structuresDesc, {
                getSiteData: function () {
                    return siteData;
                },
                getAllRenderedRootIds: function () {
                    return ['masterPage', currentPage];
                },
                getRuntimeDal: function () {
                    return privates.viewerPrivateServices.siteDataAPI.runtime;
                }
            });
            getDomNode('masterPage').style.visibility = '';
            getDomNode(navInfo.pageId).style.visibility = '';
            onReady(privates);
        });
    }

    function renderClientSide(conditionalPackages, ajaxHandler, siteModel, siteProps, onReady) {
        var privates = createSitePrivates(conditionalPackages, ajaxHandler, siteModel);
        renderClientSideWithPrivates(conditionalPackages, privates, siteProps, onReady);
    }

    function renderClientSideWithPrivates(conditionalPackages, privates, siteProps, onReady) {
        var documentServices = conditionalPackages.documentServices;
        try {
            if (documentServices && _.isUndefined(window.karmaIntegration) && window.parent.FS) {
                utils.integrations.fullStory.start();
            }
        } catch (ex) {
            // This happens when preview is opened by Site History
        }

        if (documentServices) {
            privates.siteDataWrapper.dataLoadedRegistrar = privates.siteDataAPI.registerDataLoadedCallback.bind(privates.siteDataAPI);

            window.documentServices = new documentServices.Site(
                getDSConfig(documentServices.configs, privates.siteModel.currentUrl),
                privates.siteDataWrapper,
                _.partial(fixPages, privates.siteModel, privates.isServerSideRender),
                _.partial(buildRenderedSite, conditionalPackages, privates.displayedSiteData, privates.viewerPrivateServices, siteProps));
            _.set(window, 'testApi.documentServices', window.documentServices);
        } else {
            privates.fullSiteData.pagesData = privates.fullSiteData.pagesData && fixPages(privates.siteModel, privates.isServerSideRender, privates.fullSiteData.pagesData);
            buildRenderedSite(conditionalPackages, privates.displayedSiteData, privates.viewerPrivateServices, siteProps, onReady);
        }
    }

    return {
        clientSide: renderClientSide,
        clientSideWithPrivates: renderClientSideWithPrivates,
        serverSide: renderServerSide,
        fixPages: fixPages
    };
});
