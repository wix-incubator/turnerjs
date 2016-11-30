define([
    'wixappsCore',
    'react',
    'reactDOMServer',
    'lodash',
    'testUtils/util/mockFactory'
], function (/** wixappsCore */ wixapps, React, ReactDOMServer, _, mockFactory) {
    'use strict';

    function proxyBuilder(proxyName, props) {
        var proxy = wixapps.proxyFactory.getProxyClass(proxyName)(props);
        return React.addons.TestUtils.renderIntoDocument(proxy);
    }

    function proxyStringBuilder(proxyName, props) {
        var proxy = wixapps.proxyFactory.getProxyClass(proxyName)(props);
        return ReactDOMServer.renderToString(proxy);
    }

    /**
     * Builds default props for proxy testing
     * @param {ViewDefinition} viewDef The view definition
     * @param {*=} data The proxy data
     * @param {object=} siteDataModel The site data to use in order to build the core.SiteData object.
     * @param {object=} themeModel
     * @returns {proxy.properties}
     */
    function proxyPropsBuilder(viewDef, data, siteDataModel, themeModel) {
        var viewContextMap = new wixapps.ViewContextMap();
        var siteAPI = mockFactory.mockSiteAPI(siteDataModel);
        var siteData = siteAPI.getSiteData();
        var functionLibrary = new wixapps.FunctionLibrary(siteData);
        //if (themeModel) {
            var allTheme = _.defaultsDeep({}, themeModel, siteData.getAllTheme());
            spyOn(siteData, 'getAllTheme').and.returnValue(allTheme);
        //}
        spyOn(siteData, 'getFont');
        var proxyData = data;
        var props = {
            skin: "skins.core.VerySimpleSkin",
            id: "TestProxy",

            parentId: 'testParent',
            viewName: 'testView',
            viewDef: viewDef,
            logic: {},
            viewContextMap: viewContextMap,
            //contextPath: viewContextMap.newContextForDataItem(null, []),
            functionLibrary: functionLibrary,
            parentContextPath: null,
            contextProps: {
                path: [],
                vars: {
                    view: {},
                    proxy: {}
                },
                events: {},
                functionLibrary: {}
            },
            viewProps: {
                compProp: {
                    direction: 'ltr'
                },
                siteAPI: siteAPI,
                siteData: siteData,
                loadedStyles: {},
                resolveImageData: _.identity,
                getNormalizedDataPath: function (contextPath, path) {
                    return _.without(path, "this");
                },
                getDataByPath: function (contextPath, path) {
                    var absDataPath = path;
                    if (contextPath) {
                        absDataPath = viewContextMap.resolvePath(contextPath, path);
                    }
                    return _.reduce(absDataPath, function (result, prop) {
                        return prop === "this" ? result : result[prop];
                    }, data);
                },
                setDataByPath: function (contextPath, dataPath, value) {
                    var absDataPath = viewContextMap.resolvePath(contextPath, dataPath);
                    var property = _.last(absDataPath);

                    absDataPath.splice(absDataPath.length - 1, 1);
                    var dataInPath = _.reduce(absDataPath, function (result, prop) {
                        return prop === "this" ? result : result[prop];
                    }, proxyData);

                    dataInPath[property] = value;
                },
                getViewDef: _.noop,
                getLocalizationBundle: function () {
                    return {};
                },
                setVar: _.noop,
                classSet: _.noop,
                getPartDefinition: jasmine.createSpy().and.returnValue({})
            }
        };

//        if (data !== undefined) {
//            props.proxyData = data;
//        }

        return props;
    }

    function createImageData(src, width, height, title) {
        return {
            _type: 'wix:Image',
            title: title || '',
            src: src,
            width: width,
            height: height
        };
    }

    function createRichTextData(text, version) {
        return {
            "version": version || 2,
            "_type": "wix:RichText",
            "links": [],
            "text": text
        };
    }

    function createTextField(data, layout, labelProps) {
        return {
            "data": data,
            "comp": {
                "name": "TextField",
                "items": [
                    {
                        "data": data,
                        "comp": _.defaults({
                            "name": "Label"
                        }, labelProps),
                        "layout": layout || {}
                    }
                ]
            }
        };
    }

    function createImageField(data) {
        return {
            "data": data,
            "comp": {
                "name": "Field",
                "items": [
                    {
                        "data": data,
                        "comp": {
                            "name": "Image"
                        }
                    }
                ]
            }
        };
    }

    function createVBox(items) {
        return {
            "comp": {
                "name": "VBox",
                "items": items || []
            }
        };
    }

    var stupidProxy = {
        mixins: [wixapps.baseProxy],
        renderProxy: function () {
            var props = this.getChildCompProps();
            return React.DOM.div(props);
        }
    };

    return {
        proxyBuilder: proxyBuilder,
        proxyStringBuilder: proxyStringBuilder,
        proxyPropsBuilder: proxyPropsBuilder,
        stupidProxy: stupidProxy,
        data: {
            createImageData: createImageData,
            createRichTextData: createRichTextData
        },
        viewDef: {
            createTextField: createTextField,
            createImageField: createImageField,
            createVBox: createVBox
        }
    };
});
