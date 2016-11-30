define(['lodash', 'santaProps', 'utils', 'tpa/components/tpaPopup'], function (_, santaProps, utils) {
    "use strict";

    function getPopupStructure() {
        return {
            "componentType": "wysiwyg.viewer.components.tpapps.TPAPopup",
            "type": "Component",
            "id": utils.guidUtils.getUniqueId(),
            "skin": "wysiwyg.viewer.skins.TPAPopupSkin",
            "styleId": ""
        };
    }

    function getComp(structure, siteAPI, loadedStyles, data, callback) {
        var props = santaProps.componentPropsBuilder.getCompProps(structure, siteAPI, null, loadedStyles);
        props.compData = data;
        props.onCloseCallback = callback;
        return utils.compFactory.getCompClass(structure.componentType)(props);
    }

    /**
     *
     * @param {core.SiteAspectsSiteAPI} aspectSiteApi
     * @implements {core.SiteAspectInterface}
     * @constructor
     */
    function TPAPopupAspect(aspectSiteApi) {
        /** @type core.SiteAspectsSiteAPI */
        this.aspectSiteApi = aspectSiteApi;
        this.shouldShowPopup = false;
        this.tpaPopup = [];
        this.aspectSiteApi.registerToUrlPageChange(this.removeAllPopups.bind(this));
    }

    TPAPopupAspect.prototype = {
        getComponentStructures: function () {
            if (this.shouldShowPopup) {
                return [getPopupStructure()];
            }
            return null;
        },

        /**
         *
         * @returns {ReactComponent[]}
         */
        getReactComponents: function (loadedStyles) {
            var comp;
            if (this.shouldShowPopup) {
                if (this.shouldShowNewPopup){
                    this.shouldShowNewPopup = false;
                    var popupStructure = getPopupStructure();
                    comp = getComp(popupStructure, this.aspectSiteApi.getSiteAPI(), loadedStyles, this.popupData, this.popupOnClose);
                    this.tpaPopup.push(comp);
                }

                return this.tpaPopup;
            }
            return null;
        },


        showPopup: function(data, callback) {
            this.shouldShowPopup = true;
            this.shouldShowNewPopup = true;
            this.popupData = data;
            this.popupOnClose = callback;
            this.aspectSiteApi.forceUpdate();
        },

        removePopup: function (comp) {
            var compId = comp.props.id;
            var popups = this.tpaPopup;
            this.tpaPopup = _.reject(popups, {props: {id: compId}});
        },

        removeAllPopups: function () {
            if (!_.isEmpty(this.tpaPopup)){
                this.tpaPopup = [];
                this.shouldShowPopup = false;
                this.aspectSiteApi.forceUpdate();
            }
        }
    };

    return TPAPopupAspect;
});
