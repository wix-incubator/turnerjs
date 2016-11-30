define(["lodash", "react", "utils"], function (_, React, utils) {
    'use strict';

    var proxyDefinitions = {};
    var proxies = {};

    function register (name, proxyDef) {
        proxyDef.displayName = name + "Proxy";
        proxyDefinitions[name] = proxyDef;
    }

    function getProxyClass (name, reactClass) {
        if (!_.has(proxyDefinitions, name)) {
            name = "View";
        }

        var proxy = proxies[name];
        if (proxy) {
            return reactClass ? proxy.class : proxy.factory;
        }


        var proxyDef = proxyDefinitions[name];
        if (!proxyDef) {
            throw "no such proxy definition for name: " + name;
        }

        var proxyClass = React.createClass(proxyDef);
        proxy = React.createFactory(proxyClass);
        proxies[name] = {
            'class': proxyClass,
            factory: proxy
        };

        return getProxyClass(name, reactClass);
    }

    function invalidate(name) {
        delete proxies[name];
    }

    function extend(name, proxyDefinitionExtension) {
        if (!proxyDefinitions.hasOwnProperty(name)) {
            utils.log.error("Trying to extend component [" + name + "] but the component is not defined");
            return;
        }

        var proxyDefinition = proxyDefinitions[name];
        proxyDefinition.mixins = [proxyDefinitionExtension].concat(proxyDefinition.mixins || []);
    }

    function isValidProxyName(name) {
        return _.has(proxyDefinitions, name);
    }

    var missingProxy = function (proxyName) {
        return {
            displayName: proxyName,
            render: function () {
                return React.DOM.div(null, proxyName);
            }
        };
    };
    var missingProxyList = ["Label", "ClippedParagraph", "ClippedParagraph2", "Date", "DateEdit", "TimeEdit", "InlineText", "InlineTextInput", "TextInput", "ErasableTextInput", "NumberInput", "NumericStepper", "CheckBox", "CheckBoxViewProxy", "RichTextEditor", "RichTextEditorInline", "Price", "EnumSelector", "Image", "Video", "VideoSelector", "VideoThumb", "ImageSelector", "ImageInput", "VerticalList", "FlowList", "MultiColumn", "VerticalListEditor", "DraggableListItem", "Box", "VBox", "HBox", "Field", "FieldBox", "TextField", "DataEditField", "Stack", "Css", "InlineSpacer", "HorizontalLine", "VerticalLine", "Switch", "SwitchBox", "OptionalArea", "SuperFlow", "Button", "Button2", "Table", "Deck", "TabMenu", "Icon", "StringArrayInput", "Toggle", "MusicPlayer", "AudioInput", "InlineSvg", "Link", "LinkSelector", "OptionsList", "SelectOptionsList", "OptionsListInput", "ComboBox", "RadioGroup", "CheckBoxGroup", "TextArea", "Area", "Container", "ZoomLink", "AppLink", "ZoomLayout", "FixedRatioLayout", "GoogleMap", "LocationSelector", "TagInput", "DragAndDropVList", "List2", "PaginatedList", "UnstyledLabel", "TooltipIcon", "Help", "IFrame", "ImageButton", "TPAGallery", "MediaRichTextEditorInline", "MediaLabel", "MediaThumb", "Gallery", "GridGallery", "SliderGallery", "ColumnGallery", "PaginatedColumnGallery"];
    _.forEach(missingProxyList, function (proxyName) {
        register(proxyName, missingProxy(proxyName));
    });

    /**
     * @class wixappsCore.proxyFactory
     */
    return {
        /**
         * Gets the cached class definition of the proxy or instantiating it on-demand
         * @param name The proxy name
         * @returns {ReactComponent} The react component for the requested name
         */
        getProxyClass: getProxyClass,

        /**
         * Registers a proxy definition in the proxy factory
         * @param name The name of the proxy
         * @param proxyDefinition The js object (dictionary) that defines the proxy. It will instantiated
         * when used for the first time. In order to change in runtime, use the invalidate method.
         */
        register: register,

        /**
         * Invalidates the proxy class. This means that you can register a different
         * class and have a new class next time a proxy is rendered. This is for runtime change of the
         * class, and should be used mainly for debugging purposes
         * @param name The name of the proxy
         */
        invalidate: invalidate,

        /**
         * Allows extending the definition of a proxy class by extension packages. This
         * is used for enrichment of proxies for automation qa, editor decorations, etc.
         * @param name The name of the proxy to extend
         * @param proxyDefinitionExtension The overriding methods and properties of the proxy
         */
        extend: extend,

        /**
         * Returns true iff passing this name to getProxyClass will not return the ViewProxy
         * @param name The name to check
         */
        isValidProxyName: isValidProxyName
    };
});
