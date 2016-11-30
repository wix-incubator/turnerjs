define(["lodash", "react", "wixappsCore/util/viewsUtils", "wixappsCore/proxies/mixins/baseProxy", "wixappsCore/proxies/mixins/baseCompositeProxy", "wixappsCore/core/stylesheetRenderer", "wixappsCore/util/typeNameResolver", "wixappsCore/util/wrappedProxyStyles"],
    function (_, React, /** wixappsCore.viewsUtils */ viewsUtils, baseProxy, baseCompositeProxy, /** wixappsCore.stylesheetRenderer */ stylesheetRenderer, /** wixappsCore.typeNameResolver */typeNameResolver, /** wixappsCore.wrappedProxyStyles */ wrappedProxyStyles) {
    'use strict';

    function getChildProps(viewDef, viewName, forType) {
        var props = this.getChildProxyProps(viewDef);
        props.viewDef = viewDef;
        props.viewName = viewName;
        props.forType = forType;
        props.viewId = viewsUtils.sanitizeCompId(viewName + '_' + forType + '_' + this.props.formatName);
        props.viewContainerId = viewsUtils.sanitizeCompId(props.viewId + '_' + this.contextPath);
        props.parentContextPath = this.innerContextPath;
        return props;
    }

    function renderStylesheet(stylesheet, compId, viewId) {
        var styleData = stylesheetRenderer.render(stylesheet, compId, viewId);
        return React.DOM.style({
            type: "text/css",
            key: compId + "." + viewId,
            dangerouslySetInnerHTML: {
                __html: styleData || ''
            }
        });
    }

    var wixappsStyleSheet = React.createClass({
        displayName: "WixappsStyleSheet",
        mixins: [baseProxy],

        renderProxy: function () {
            return renderStylesheet(this.getViewDefProp("stylesheet"), this.props.viewProps.compId, this.props.viewContainerId);
        }
    });

    function getContainerProps(props, childViewStyleDef, proxyStyle) {
        var containerProps = this.getChildCompProps();
        containerProps.id = props.viewContainerId;
        containerProps.ref = "viewWrapper";
        containerProps.style = _.merge({}, childViewStyleDef, proxyStyle);
        containerProps.className += " " + wrappedProxyStyles.getWrapperCssClass(containerProps.style);
        return containerProps;
    }

    /**
     * @class proxies.View
     * @extends proxies.mixins.baseCompositeProxy
     */
    return {
        mixins: [baseCompositeProxy],
        renderProxy: function () {
            var viewName = this.getCompProp('name') || this.props.viewName;
            var data = this.proxyData;
            var forType = typeNameResolver.getDataItemTypeName(data);
            var viewDef = this.props.viewProps.getViewDef(viewName, forType, this.props.formatName);

            if (!viewDef) {
                throw "ViewProxy:: Cannot find view definition for viewName [" + viewName + "] typeName [" + forType + "] format [" + this.props.formatName + "]";
            }

            var viewData = this.getViewDefProp("data") || "this";
            var viewVars = _.merge({}, this.getCompProp("vars"), this.getViewDefProp("vars", viewDef));

            // if we haven't created a context already or the context we created was deleted from the context map - create a new one
            if (!this.innerContextPath || !this.props.viewContextMap.hasContext(this.innerContextPath)) {
                this.innerContextPath = this.createContext(this.contextPath, [viewData], {view: viewVars}, {}, {});
            }
            var props = getChildProps.call(this, viewDef, viewName, forType);
            var proxyStyle = this.getProxyStyle();
            var childViewStyleDef = this.getStyleDef(viewDef, this.innerContextPath);
            var containerProps = getContainerProps.call(this, props, childViewStyleDef, proxyStyle);

            var childProxyStyle = wrappedProxyStyles.getProxyStyles(containerProps.style);
            if (_.has(containerProps.style, "height")) {
                childProxyStyle.height = childProxyStyle.width = "100%";
            }

            var childProxy = this.renderChildProxy(viewDef, "child", childProxyStyle, props);

            //var stylesheet = renderStylesheet(this.getViewDefProp("stylesheet", viewDef), this.props.compId, viewContainerId);

            var stylesheetProps = getChildProps.call(this, viewDef, viewName, forType);
            stylesheetProps.key = 'stylesheet';
            var stylesheet = React.createElement(wixappsStyleSheet, stylesheetProps);

            return React.DOM.div(containerProps, stylesheet, childProxy);
        }
    };
});
