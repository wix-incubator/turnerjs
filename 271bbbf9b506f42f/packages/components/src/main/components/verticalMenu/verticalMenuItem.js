define(['skins', 'components/components/verticalMenu/verticalMenuDomBuilder'], function (skinsPackage, domBuilder) {
    'use strict';

    var menuItem = {
        displayName: 'MenuItem',
        render: function () {
            var skin = domBuilder.getSkin(skinsPackage.skins, this.props.skin),
                template = domBuilder.buildTemplate(skin.react[0], this.props.classPrefix);

            return domBuilder.buildDOMFromTemplate(template, this.props.data, this.props.classPrefix, this.props.currentUrlPageId, this.props.heights, this.props.hoverId, this.props.callbacks, this.props.isDesktop, this.props.isIE);
        }
    };

    return menuItem;
});
