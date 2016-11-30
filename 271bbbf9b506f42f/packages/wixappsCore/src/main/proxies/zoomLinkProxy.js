define(["lodash", "wixappsCore/proxies/mixins/zoomProxy", "wixappsCore/util/wixappsUrlParser"], function (_, zoomProxy, /** wixappsCore.wixappsUrlParser */ wixappsUrlParser) {
    'use strict';

    /**
     * @class proxies.ZoomLink
     * @extends proxies.mixins.zoomProxy
     */
    return {
        mixins: [zoomProxy],

        getCustomProps: function () {
            var aspect = this.props.viewProps.siteAPI.getSiteAspect("wixappsDataAspect");
            var descriptor = aspect.getDescriptor(this.props.viewProps.packageName);
            var partDef = this.props.viewProps.getPartDefinition();
            var zoomPartDef = _.find(descriptor.parts, {id: partDef.zoomPartName[0]});
            var partData = this.props.viewProps.getPartData();
            var permaLinkId = zoomPartDef.zoomParams.urlIdPrefix + partData.appInnerID;

            var props = {};
            props.href = wixappsUrlParser.getAppPartZoomUrl(this.props.viewProps.siteData, permaLinkId, this.proxyData._iid || this.proxyData.id, this.proxyData.title);


            props.pathToItems = this.props.viewProps.getNormalizedDataPath(this.contextPath, this.getCompProp('listExpression')).join('.');
            return props;
        }
    };
});
