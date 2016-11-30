define(['core', 'react', 'utils'], function(core, React, utils){
    'use strict';

    var mixins = core.compMixins;
    var cssUtils = utils.cssUtils;

    /**
     * Creates DOM representation of each menu button
     *
     * @param {Object} menuData - menu data which should be like {label: 'label', link: '/link'}
     * @param {string} styleId - style ID
     * @returns {Array} - children elements array
     * @private
     */
    function createButtons(menuData, styleId){
        var children = [];

        menuData.forEach(function(data){
            children.push(React.DOM.li({
                children:[
                    React.DOM.a({
                        href: data.link,
                        className: cssUtils.concatenateStyleIdToClassName(styleId, 'buttonLink')
                    }, data.label)
                ],
                className: styleId + 'buttonTemplate'
            }));
        }, this);

        return children;
    }

    /**
     * @class wysiwyg.viewer.components.wixhomepage.WixHomepageMenu
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        mixins: [mixins.skinBasedComp],

        getInitialState: function(){
            return {
                $menuType: this.props.compData.menuDataSource
            };
        },

        getSkinProperties: function(){
            var menuType = this.props.compData.menuDataSource,
                siteData = this.props.siteData,
                wixHomePage = siteData.wixHomepage,
                currentLangCode = utils.wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl),
                menuData;

            if (wixHomePage && wixHomePage[menuType] && wixHomePage[menuType][currentLangCode]){
                menuData = wixHomePage[menuType][currentLangCode];
            } else {
                menuData = [ // We didn't find the menu, create something (For QA)
                    {label: 'Create', link: '/create/website'},
                    {label: 'Explore', link: '/sample/website'},
                    {label: 'Features', link: '/about/features'},
                    {label: 'My Account', link: '/create/my-account'},
                    {label: 'Premium', link: '/upgrade/website'},
                    {label: 'Support', link: '/support/'}
                ];
            }

            return {
                buttonTemplate: {
                    style: {
                        display: 'none'
                    }
                },
                
                buttonsContainer: {
                    children: createButtons(menuData, this.props.styleId)
                }
            };
        }
    };
});