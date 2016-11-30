define(['lodash'], function (_) {
    'use strict';
    var TPA_PUB_SUB_PREFIX = 'TPA_PUB_SUB_';

    var _cacheKiller;

    var getCacheKiller = function() {
        if (_.isUndefined(_cacheKiller)) {
            _cacheKiller = getRandomCacheKiller();
        }

        return _cacheKiller;
    };

    function getRandomCacheKiller(){
        return _.now() + '';
    }

    var getAppData = function (siteAPI, compId) {
        var comp = siteAPI.getComponentById(compId);
        var spec = comp && siteAPI.getSiteData().getClientSpecMapEntry(comp.props.compData.applicationId);

        return spec;
    };

    var getClientSpecMap = function(siteAPI) {
        return siteAPI.getSiteData().getClientSpecMap();
    };

    var getAppDefId = function (siteAPI, compId) {
        var spec = getAppData(siteAPI, compId);

        return spec ? spec.appDefinitionId : null;
    };

    var stripPubSubPrefix = function (str) {
        var prefixRegex = new RegExp('^' + TPA_PUB_SUB_PREFIX);
        return str.replace(prefixRegex, '');
    };

    var addPubSubEventPrefix = function (str) {
        return TPA_PUB_SUB_PREFIX.concat(str);
    };

    var isTPASection = function (comp) {
        var componentType = _.get(comp, 'props.structure.componentType');
        return componentType === 'wysiwyg.viewer.components.tpapps.TPASection' ||
            componentType === 'wysiwyg.viewer.components.tpapps.TPAMultiSection';
    };

    var sdkVersionIsAtLeast = function (currentVersion, requiredVersion) {
        currentVersion = currentVersion || '0.0.0';
        requiredVersion = requiredVersion || '1.41.0';

        var currentSplited = _.map(currentVersion.split('.'), function(digit) {
            return parseInt(digit, 10);
        });

        var requiredSplited = _.map(requiredVersion.split('.'), function(digit) {
            return parseInt(digit, 10);
        });

        if (currentSplited.length === 3 && requiredSplited.length === 3) {
            return currentSplited[0] >= requiredSplited[0] &&
                currentSplited[1] >= requiredSplited[1] &&
                currentSplited[2] >= requiredSplited[2];
        }
        return false;
    };

    var getVisitorUuid = function(u) {
        var vuuid = u.cookieUtils.getCookie('_wixUIDX') || '';
        vuuid = vuuid.slice(_.lastIndexOf(vuuid, '|') + 1); //remove anything before any pipe, including the pipe.
        vuuid = vuuid.replace(/^(null-user-id|null)$/g, ''); //replace invalid values with empty string.
        return vuuid;
    };

    var getInstance = function (siteAPI, appId) {
        var appsData = getClientSpecMap(siteAPI);
        var base64Instance = appsData[appId] && appsData[appId].instance.split(".")[1];
        return base64Instance && JSON.parse(window.atob(base64Instance));
    };

    var appCounter = 0; //eslint-disable-line no-unused-vars
    var incAppCounter = function () {
        ++appCounter;
    };
    var decAppCounter = function (siteAPI) {
        --appCounter;
        reportAppCounter(siteAPI);
    };
    var reportAppCounter = function (/* siteAPI */) {
        if (appCounter === 0) {
            appCounter = 1000; // TODO: temporarily sending only for first page
            //var siteData = siteAPI.getSiteData();
            //siteAPI.reportBeatEvent(16, siteData.getPrimaryPageId());
        }
    };

    var isPageMarkedAsHideFromMenu = function (appData, tpaPageId) {
        if (appData && tpaPageId) {
            if (_.includes(tpaPageId, '$TPA$')) {
                tpaPageId = tpaPageId.substr(0, tpaPageId.indexOf('$TPA$'));
            }
            var section = _.find(appData.widgets, function (widget) {
                return _.get(widget, 'appPage.id') === tpaPageId;
            });
            if (section) {
                return _.get(section, 'appPage.hideFromMenu');
            }
            return false;
        }
        return false;
    };

    return {
        Constants: {
            TPA_PUB_SUB_PREFIX: TPA_PUB_SUB_PREFIX,
            TOP_PAGE_ANCHOR_PREFIX: 'TOP_PAGE_'
        },
        getCacheKiller: getCacheKiller,
        getRandomCacheKiller: getRandomCacheKiller,
        getAppData: getAppData,
        getAppDefId: getAppDefId,
        stripPubSubPrefix: stripPubSubPrefix,
        addPubSubEventPrefix: addPubSubEventPrefix,
        isTPASection: isTPASection,
        sdkVersionIsAtLeast: sdkVersionIsAtLeast,
        getVisitorUuid: getVisitorUuid,
        getInstance: getInstance,
        getClientSpecMap: getClientSpecMap,
        incAppCounter: incAppCounter,
        decAppCounter: decAppCounter,
        reportAppCounter: reportAppCounter,
        isPageMarkedAsHideFromMenu: isPageMarkedAsHideFromMenu
    };
});
