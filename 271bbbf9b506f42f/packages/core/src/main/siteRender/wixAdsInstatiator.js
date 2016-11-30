define(['lodash', 'santaProps', 'siteUtils'], function(_, santaProps, siteUtils){
    "use strict";

    var adDataDefault = {
        mobile: {
            "footerLabel": "7c3dbd_67131d7bd570478689be752141d4e28a.jpg",
            "adUrl": "http://www.wix.com/"
        },
        desktop: {
            "topLabel": "<span class=\"smallMusa\">(Wix-Logo) </span>Create a <span class=\"smallLogo\">Wix</span> site!",
            "topContent": "100s of templates<br />No coding needed<br /><span class=\"emphasis spacer\">Start now >></span>",
            "footerLabel": "<div class=\"adFootBox\"><div class=\"siteBanner\" ><div class=\"siteBanner\"><div class=\"wrapper\"><div class=\"bigMusa\">(Wix Logo)</div><div class=\"txt shd\" style=\"color:#fff\">This site was created using </div> <div class=\"txt shd\"><a href=\"http://www.wix.com?utm_campaign=vir_wixad_live\" style=\"color:#fff\"> WIX.com. </a></div> <div class=\"txt shd\" style=\"color:#fff\"> Create your own for FREE <span class=\"emphasis\"> >></span></div></div></div></div></div>",
            "adUrl": "http://www.wix.com/lpviral/en900viral?utm_campaign=vir_wixad_live"
        }
    };

    return {
        getStructure: function(siteData) {
            var isMobile = siteData.isMobileView();
            var compType = isMobile ? 'wysiwyg.viewer.components.WixAdsMobile' : 'wysiwyg.viewer.components.WixAdsDesktop';
            var skin = 'wysiwyg.viewer.skins.wixadsskins.WixAdsWebSkin';

            return {
                id: siteData.WIX_ADS_ID,
                skin: skin,
                componentType: compType,
                styleId: 'wixAds',
                layout: {
                    position: isMobile ? 'static' : 'absolute'
                }
            };
        },

        //TODO: pass data to comp in props
        getWixAdsComponent: function (siteAPI) {
            var siteData = siteAPI.getSiteData();
            var isMobile = siteData.isMobileView();
            var adData;

            if (isMobile) {
                adData = (siteData.mobileAdData && !_.isEmpty(siteData.mobileAdData.adUrl)) ? siteData.mobileAdData : adDataDefault.mobile;
            } else {
                adData = (siteData.adData && !_.isEmpty(siteData.adData.adUrl)) ? siteData.adData : adDataDefault.desktop;
            }

            var structure = this.getStructure(siteData);
            var compType = structure.componentType;

            var wixAdsConstructor = siteUtils.compFactory.getCompClass(compType);

            var props = santaProps.componentPropsBuilder.getCompProps(structure, siteAPI);

            props.adData = adData;
            return wixAdsConstructor(props);
        }
    };
});
