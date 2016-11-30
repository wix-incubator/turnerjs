define(['santaProps', 'core/core/siteAspectsRegistry', 'siteUtils'],
    function (santaProps, /** core.siteAspectsRegistry */ siteAspectsRegistry, siteUtils) {
    'use strict';

        function getStructure(siteData){
            if (!siteData.isMobileDevice() || !siteData.renderFlags.renderMobileActionMenu) {
                return null;
            }

            var siteMetaData = siteData.getSiteMetaData();
            if (!siteMetaData || !siteMetaData.quickActions || !siteMetaData.quickActions.configuration.quickActionsMenuEnabled){
                return null; // skip menu rendering if flagged as disabled
            }

            return {
                id: "MOBILE_ACTIONS_MENU",
                skin: "wysiwyg.viewer.skins.mobile.MobileActionsMenuSkin",
                componentType:"wysiwyg.viewer.components.MobileActionsMenu",
                styleId: "mobileActionsMenu",
                layout: {
                    position: "static"
                }
            };
        }

    function MobileActionsMenuAspect(siteAPI){
        this._siteAspectsSiteAPI = siteAPI;
    }

    MobileActionsMenuAspect.prototype = {
        getReactComponents: function (loadedStyles) {
            var siteData = this._siteAspectsSiteAPI.getSiteData();
            var structure = getStructure(siteData);
            if (!structure){
                return null;
            }

            var props = santaProps.componentPropsBuilder.getCompProps(structure, this._siteAspectsSiteAPI.getSiteAPI(), null, loadedStyles);
            props.userColorScheme = siteData.rendererModel.siteMetaData.quickActions.colorScheme;
            var compConstructor = siteUtils.compFactory.getCompClass(structure.componentType);
            return [compConstructor(props)];
        },

        getComponentStructures: function(){
            var structure = getStructure(this._siteAspectsSiteAPI.getSiteData());
            return structure ? [structure] : null;
        }
    };

    siteAspectsRegistry.registerSiteAspect('mobileActionsMenu', MobileActionsMenuAspect);

});
