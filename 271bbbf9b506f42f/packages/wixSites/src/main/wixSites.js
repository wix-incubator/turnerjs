/*
  READ THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!
  
  iswixsite query param is REQUIRED!!!
  
  You should know that if you want
  to see this components on a page
  you must add &iswixsite=true param to an url.
 */

define([
    'wixSites/components/wixOfTheDay/wixOfTheDay',
    'wixSites/components/wixHomepageMenu/wixHomepageMenu',
    'wixSites/components/languagesDropDown/languagesDropDown',
    'wixSites/components/domainSearchBar/domainSearchBar',
    'wixSites/components/backOfficeText/backOfficeText',
    'wixSites/components/homePageLogin/homePageLogin',
    'wixSites/components/packagePicker/packagePicker',
    'wixSites/components/areaTooltip/areaTooltip',
    'wixSites/components/tpaPlaceholder/tpaPlaceholder',
    'core'
/*
..........____ _____ ___  ____  _ _ _
........./ ___|_   _/ _ \|  _ \| | | |  Developer!!
.........\___ \ | || | | | |_) | | | |  Do not add items down here,
..........___) || || |_| |  __/|_|_|_|  Add them at the top of the list!
.........|____/ |_| \___/|_|   (_|_|_)  Thanks.
*/
], function(
    wixOfTheDay,
    wixHomepageMenu,
    languagesDropDown,
    domainSearchBar,
    backOfficeText,
    homePageLogin,
    packagePicker,
    areaTooltip,
    tpaPlaceholder,
    core
    ) {
    'use strict';

    var compRegistrar = core.compRegistrar;

    compRegistrar.register('wysiwyg.viewer.components.wixhomepage.WixOfTheDay', wixOfTheDay);
    compRegistrar.register('wysiwyg.viewer.components.wixhomepage.WixHomepageMenu', wixHomepageMenu);
    compRegistrar.register('wysiwyg.viewer.components.wixhomepage.LanguagesDropDown', languagesDropDown);
    compRegistrar.register('wysiwyg.common.components.domainsearchbar.viewer.DomainSearchBar', domainSearchBar);
    compRegistrar.register('wysiwyg.common.components.backofficetext.viewer.BackOfficeText', backOfficeText);
    compRegistrar.register("wysiwyg.viewer.components.wixhomepage.HomePageLogin", homePageLogin);
    compRegistrar.register("wysiwyg.common.components.packagepicker.viewer.PackagePicker", packagePicker);
    compRegistrar.register('wysiwyg.common.components.areatooltip.viewer.AreaTooltip', areaTooltip);
});
