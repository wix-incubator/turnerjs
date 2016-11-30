/**
 *  Plugin functions that extend the viewer components to support the editing services
 **/

define(['skins', 'lodash', 'utils'], function (skins, _, utils) {
    'use strict';

    var hiddenComponents = [];
    var urlUtils = utils.urlUtils;

    function init(siteModel) {
        extendViewerComponents();
        getHiddenComponentsLIstFromUrl();
        setRenderFlags(siteModel);
    }

    function setRenderFlags(siteModel){
        if (_.includes(hiddenComponents, 'WixAdsDesktop')) {
            siteModel.renderFlags.isWixAdsAllowed = false;
        }
    }

    function getHiddenComponentsLIstFromUrl() {
        if (typeof window !== 'undefined') {
            var urlParams = urlUtils.parseUrl(window.location.href).query;
            if (urlParams && urlParams.hideComponents) {
                var separatorRegex = /,|%2C|%252C/;
                hiddenComponents = urlParams.hideComponents.split(separatorRegex);
            }
        }
    }

    function extendViewerComponents() {
        skins.registerRenderPlugin(markComponentHtmlElements);
    }

    function markComponentHtmlElements(refData, skinTree, structure, props /*, state*/) {
        markTopLevelRef(refData, structure);
        markRefChildren(refData);
        addMissingSkinpartRefs(refData, skinTree);
        hideComponentIfNeeded(refData, skinTree, structure, props);
        markStubPages(refData, structure, props);
        markScreenInAnimation(refData, props);
    }

    function hideComponentIfNeeded(refData, skinTree, structure, props) {
        if (structure.componentType) {
            var shortComponentName = structure.componentType.substr(structure.componentType.lastIndexOf('.') + 1);
            if (_.includes(hiddenComponents, shortComponentName)) {
                hideComponent(refData, skinTree, shortComponentName, props);
            }
        }
    }

    function hideComponent(refData, skinTree, componentName, props) {
        if (_.includes(['WixAdsDesktop', 'WixAdsMobile'], componentName)) {
            hideWixAds(refData, props);
        } else {
            var blockerDiv = ['div', 'qa-blocker', [], {}];
            skinTree.push(blockerDiv);
            refData['qa-blocker'] = {
                style: {
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'red',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }
            };
        }
    }

    function hideWixAds(refData, props) {
        refData[''].style = {opacity: 0, minHeight: props.isMobileView ? '30px' : ''};
    }

    function markTopLevelRef(refData, structure) {
        refData['']["data-comp"] = (structure && structure.componentType) || '';

        if (structure && structure.skinPart) {
            refData['']['data-skinpart'] = structure.skinPart;
        }

        if (structure && structure.styleId) {
            refData['']['data-styleid'] = structure.styleId;
        }
        if (structure && structure.originalStyleId) {
            refData['']['data-originalstyleid'] = structure.originalStyleId;
        }


    }

    function markStubPages(refData, structure, props) {
        if (structure && structure.type === 'Page') {
            refData['']["data-stub"] = props.pageStub ? 'true' : 'false';
        }

    }

    function markRefChildren(refData) {
        _.forIn(refData, function (refItem, name) {
            if (name !== '' && refItem instanceof Object) {
                if (Object.isExtensible(refItem)) {
                    refItem['data-skinpart'] = name;
                }
            }
        });
    }

    function markScreenInAnimation(refData, props) {
        var behaviors = props && props.compBehaviors,
            items = _.get(behaviors, 'items'),
            behavior;

        if (!_.isEmpty(items)) {
            if (_.isString(items)) {
                items = JSON.parse(items) || [];
            }

            behavior = items[0];

            if (behavior && behavior.action === 'screenIn') {
                refData['']['data-animation'] = behavior.name;
            }
        }
    }

    function addMissingSkinpartRefs(refData, skinTree) {
        var allSkinPartNames = getAllSkinPartNames(skinTree);
        _.forEach(allSkinPartNames, function (name) {
            if (_.isUndefined(refData[name])) {
                refData[name] = {'data-skinpart': name};
            }
        });
    }

    function getAllSkinPartNames(skinTree) {
        return _(skinTree)
            .flattenDeep()
            .filter(_.isString)
            .filter(function(v, i) { return i % 2 !== 0; })
            .value();
    }

    return {
        'init': init
    };
});
