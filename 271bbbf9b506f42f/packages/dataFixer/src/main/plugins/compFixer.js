define(['lodash', 'coreUtils', 'experiment'], function (_, coreUtils, experiment) {
    'use strict';

    var replacementMap = {
        'wysiwyg.viewer.components.HorizontalMenu': {
            comp: 'wysiwyg.viewer.components.menus.DropDownMenu',
            dataQuery: '#MAIN_MENU'
        }
    };

    function replaceNameIfNeeded(pageJson, component) {
        var type = component.componentType,
            replacement = replacementMap[type];

        if (replacement) {
            component.componentType = replacement.comp;
            if (replacement.dataQuery) {
                component.dataQuery = replacement.dataQuery;
            }
            if (replacement.callback) {
                replacement.callback(pageJson);
            }
        }
    }

    function fixCompHeight(pageJson, component) {
        if (component.componentType === 'wysiwyg.viewer.components.ItunesButton') {
            component.layout.height = Math.round(component.layout.width / 2.75);
        }
    }

    function getComponentProperties(pageJson, comp) {
        return pageJson.data.component_properties[comp.propertyQuery];
    }

    function getComponentData(pageJson, comp) {
        return comp.dataQuery && pageJson.data.document_data[comp.dataQuery.replace('#', '')];
    }

    function setComponentProperties(pageJson, comp, propertyItem) {
        pageJson.data.component_properties[comp.propertyQuery] = propertyItem;
    }

    function setComponentData(pageJson, comp, dataItem) {
        var newId = coreUtils.guidUtils.getUniqueId("dataItem", "-");

        comp.dataQuery = '#' + newId;
        dataItem.id = newId;
        pageJson.data.document_data[newId] = dataItem;
    }

    function findCompHeight(comp) {
        if (comp.components.length > 0) {
            var compsBottomY = _.map(comp.components, function (component) {
                return component.layout.y + component.layout.height;
            });
            return _.max(compsBottomY);
        }
        return 0;
    }

    function findFooterY(pageJson) {
        var pagesContainer = _.find(pageJson.structure.children, {id: "PAGES_CONTAINER"});
        return pagesContainer.layout.y + pagesContainer.layout.height;
    }

    function addDefaultLayout(pageJson, comp) {
        if (comp.id === "SITE_FOOTER" && !comp.layout) {
            comp.layout = {
                anchors: [],
                fixedPosition: false,
                height: findCompHeight(comp),
                rotationInDegrees: 0,
                scale: 1,
                width: 320,
                x: 0,
                y: findFooterY(pageJson)
            };
        }
    }

    function addDefaultData(pageJson, comp) {
        if (getComponentData(pageJson, comp)) {
            return;
        }

        switch (comp.componentType) {
            case 'wysiwyg.viewer.components.svgshape.SvgShape':
                setComponentData(pageJson, comp, {
                    link: null,
                    type: 'SvgShape'
                });
                break;
            case 'wysiwyg.viewer.components.WFacebookComment':
                setComponentData(pageJson, comp, {
                    type: 'WFacebookComment',
                    urlFormat: 'hashBang'
                });
                return;
            case 'wysiwyg.viewer.components.WFacebookLike':
                setComponentData(pageJson, comp, {
                    type: 'WFacebookLike',
                    urlFormat: 'hashBang'
                });
                return;
            default:
                break;
        }
    }

    function fixCompData(pagesJson, comp){
        var data = getComponentData(pagesJson, comp);
        if (!data) {
            return;
        }
        switch (comp.componentType) {
            case 'wysiwyg.viewer.components.ClipArt':
                data.title = "";
                return;
            case 'wysiwyg.viewer.components.FacebookShare':
                data.urlFormat = data.urlFormat || 'hashBang';
                return;
            case 'wysiwyg.viewer.components.VKShareButton':
                data.urlFormat = data.urlFormat || 'hashBang';
                return;
            case 'wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt':
                data.urlFormat = data.urlFormat || 'hashBang';
                return;
            case 'wysiwyg.viewer.components.WTwitterTweet':
                data.urlFormat = data.urlFormat || 'hashBang';
                return;
            case 'wysiwyg.viewer.components.WFacebookComment':
                data.urlFormat = data.urlFormat || 'hashBang';
                return;
            case 'wysiwyg.viewer.components.WFacebookLike':
                data.urlFormat = data.urlFormat || 'hashBang';
                return;
        }

    }

    function addDefaultProperties(pageJson, comp) {
        if (getComponentProperties(pageJson, comp)) {
            return;
        }

        switch (comp.componentType) {
            case 'wysiwyg.viewer.components.menus.DropDownMenu':
            {
                setComponentProperties(pageJson, comp, {
                    alignButtons: 'center',
                    alignText: 'center',
                    sameWidthButtons: false,
                    moreButtonLabel: "More",
                    moreItemHeight: 15,
                    stretchButtonsToMenuWidth: true,
                    type: 'HorizontalMenuProperties'
                });
                break;
            }
            case 'wysiwyg.viewer.components.mobile.TinyMenu':
            {
                var newId = "TINY_MENU";
                comp.propertyQuery = newId;
                setComponentProperties(pageJson, comp, {
                    direction: 'left',
                    type: 'TinyMenuProperties',
                    id: newId,
                    metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                });
                break;
            }
            default:
                break;
        }
    }

    /**
     * this is caching the properties by comp id, so that we can access it in mobile in case there are missing properties
     * @param cache
     * @param pageJson
     * @param comp
     */
    function cacheComponentPropertiesByCompId(cache, pageJson, comp) {
        cache.properties[comp.id] = getComponentProperties(pageJson, comp);
    }

    function fixMissingPropertiesInMobile(cache, pageJson, comp) {
        if (!getComponentProperties(pageJson, comp) && cache.properties[comp.id]) {
            setComponentProperties(pageJson, comp, cache.properties[comp.id]);
        }
    }

    function fixCompProps(pageJson, comp) {
        var props = getComponentProperties(pageJson, comp);
        if (!comp.propertyQuery || !props) {
            return;
        }

        switch (comp.componentType) {
            case 'wysiwyg.viewer.components.WFacebookLike':
                if (!props.language) {
                    props.language = 'en';
                }
                break;
            case 'wysiwyg.viewer.components.PayPalButton':
                if (!props.language) {
                    props.language = 'en';
                }
                break;
            case 'wysiwyg.viewer.components.GoogleMap':
                if (!props.language) {
                    props.language = 'en';
                }
                break;
            case 'wysiwyg.viewer.components.WRichText':
                if (props.type !== 'WRichTextProperties'){
                    delete comp.propertyQuery;
                }
                break;
            default:
                break;
        }
    }

    /**
     * This is a temporary data fixer for experiment viewerGeneratedAnchors
     * It will mark packed pages, this are pages that have their text components packed
     *
     * It should run only in public viewer sites
     * And should be removed when merged
     */
    function checkPackedTexts(packedPropKey, pageJson, comp) {
        if (comp.componentType !== 'wysiwyg.viewer.components.WRichText') {
            return;
        }
        var textProps = getComponentProperties(pageJson, comp);
        if (!textProps || !textProps.packed){
            _.set(pageJson, ['structure', packedPropKey], false);
        }
    }

    function runOnAllComps(pageJson, comps, funcs) {
        _.forEach(comps, function (comp) {
            _.forEach(funcs, function (func) {
                func(pageJson, comp);
            });
            if (comp.components) {
                runOnAllComps(pageJson, comp.components, funcs);
            }
        });
    }

    function fixDesktopComps(pageJson, cache, comps) {
        var checkPackedTextsDesktop = _.noop;
        if (experiment.isOpen('viewerGeneratedAnchors') && (typeof (window) === 'undefined' || window.publicModel)) {
            pageJson.structure.isPagePackedDesktop = true;
            checkPackedTextsDesktop = _.partial(checkPackedTexts, 'isPagePackedDesktop');
        }

        runOnAllComps(pageJson, comps, [
            replaceNameIfNeeded,
            fixCompHeight,
            addDefaultData,
            addDefaultProperties,
            fixCompProps,
            fixCompData,
            checkPackedTextsDesktop,
            _.partial(cacheComponentPropertiesByCompId, cache)
        ]);
    }


    function fixMobileComps(pageJson, cache, comps) {
        var checkPackedTextsMobile = _.noop;
        if (experiment.isOpen('viewerGeneratedAnchors') && (typeof (window) === 'undefined' || window.publicModel)) {
            pageJson.structure.isPagePackedMobile = true;
            checkPackedTextsMobile = _.partial(checkPackedTexts, 'isPagePackedMobile');
        }

        runOnAllComps(pageJson, comps, [
            replaceNameIfNeeded,
            fixCompHeight,
            addDefaultData,
            addDefaultProperties,
            fixCompProps,
            fixCompData,
            checkPackedTextsMobile,
            addDefaultLayout,
            _.partial(fixMissingPropertiesInMobile, cache)
        ]);
    }

    /**
     * @exports utils/dataFixer/plugins/compFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            var structureData = pageJson.structure;
            if (structureData) {
                var cache = {
                    properties: {}
                };

                var desktopComps = structureData.components || structureData.children;
                var mobileComps = structureData.mobileComponents;

                if (desktopComps) {
                    fixDesktopComps(pageJson, cache, desktopComps);
                }
                if (mobileComps) {
                    fixMobileComps(pageJson, cache, mobileComps);
                }
            }
        }
    };

    return exports;
});
