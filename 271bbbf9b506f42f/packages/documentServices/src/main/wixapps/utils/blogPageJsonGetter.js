define([
    'documentServices/page/page',
    'documentServices/wixapps/utils/blogPaginationCustomizationsGetter',
    'utils',
    'lodash'
], function (page,
             blogPaginationCustomizationsGetter,
             utils,
             _) {
    'use strict';

    return {
        getBlogFeedPageJson: getBlogFeedPageJson,
        getSinglePostPageJson: getSinglePostPageJson,
        blogComponentBuilder: blogComponentBuilderFactory
    };

    function blogComponentBuilderFactory(appInnerId) {
        return function componentBuilder(component) {
            var newComponent = componentMapper(component);
            if (_.isArray(component.components)) {
                newComponent.components = component.components.map(componentBuilder);
            }

            return newComponent;
        };

        function componentMapper(component) {
            var APP_PART_COMPONENT_TYPE = 'wixapps.integration.components.AppPart';
            if (component.componentType === APP_PART_COMPONENT_TYPE) {
                return componentWithAppId(component);
            }
            return component;

            function componentWithAppId(comp) {
                return _.merge(comp, {
                    data: {
                        appInnerID: appInnerId.toString()
                    }
                });
            }
        }
    }

    function getBlogFeedPageJson(ps, components, appInnerId) {
        var blogComponentBuilder = blogComponentBuilderFactory(appInnerId);
        return {
            'type': 'Page',
            'components': components.map(blogComponentBuilder),
            'skin': 'wysiwyg.viewer.skins.page.BasicPageSkin',
            'layout': {
                'width': 980,
                'height': 968,
                'x': 0,
                'y': 0,
                'scale': 1,
                'rotationInDegrees': 0,
                'anchors': [],
                'fixedPosition': false
            },
            'componentType': 'wixapps.integration.components.AppPage',
            'data': {
                'type': 'AppPage',
                'metaData': {
                    'isPreset': false,
                    'schemaVersion': '1.0',
                    'isHidden': false
                },
                'title': 'Blog',
                'hideTitle': true,
                'icon': '',
                'descriptionSEO': '',
                'metaKeywordsSEO': '',
                'pageTitleSEO': '',
                'pageUriSEO': 'blog',
                'hidePage': false,
                'underConstruction': false,
                'tpaApplicationId': 0,
                'pageSecurity': {
                    'requireLogin': false
                },
                'indexable': true,
                'isLandingPage': false,
                'pageBackgrounds': page.serializePage(ps, ps.siteAPI.getPrimaryPageId()).data.pageBackgrounds,
                'appPageId': '79f391eb-7dfc-4adf-be6e-64434c4838d9',
                'appPageType': 'AppPage',
                'appInnerID': appInnerId.toString(),
                'repeaterPage': false
            },
            'style': 'p2'
        };
    }

    function getSinglePostPageJson(ps, components, appInnerId) {
        var blogComponentBuilder = blogComponentBuilderFactory(appInnerId);
        return {
            'type': 'Page',
            'components': components.map(blogComponentBuilder),
            'skin': 'wysiwyg.viewer.skins.page.BasicPageSkin',
            'layout': {
                'width': 980,
                'height': 895,
                'x': 0,
                'y': 0,
                'scale': 1,
                'rotationInDegrees': 0,
                'anchors': [],
                'fixedPosition': false
            },
            'componentType': 'wixapps.integration.components.AppPage',
            'data': {
                'type': 'AppPage',
                'metaData': {
                    'isPreset': false,
                    'schemaVersion': '1.0',
                    'isHidden': false
                },
                'title': 'Single Post',
                'hideTitle': true,
                'descriptionSEO': '',
                'metaKeywordsSEO': '',
                'pageTitleSEO': '',
                'pageUriSEO': 'single-post',
                'hidePage': true,
                'mobileHidePage': true,
                'underConstruction': false,
                'tpaApplicationId': 0,
                'pageSecurity': {
                    'requireLogin': false,
                    'passwordDigest': ''
                },
                'indexable': true,
                'isLandingPage': false,
                'pageBackgrounds': page.serializePage(ps, ps.siteAPI.getPrimaryPageId()).data.pageBackgrounds,
                'appPageId': '7326bfbb-4b10-4a8e-84c1-73f776051e10',
                'appPageType': 'AppPage',
                'appInnerID': appInnerId.toString(),
                'repeaterPage': true
            },
            'style': 'p2'
        };
    }
});
