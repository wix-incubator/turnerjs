define(['core'], function (/** core */core) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.EcomCheckoutMessageDialog
     */
    return {
        displayName: "EcomCheckoutMessageDialog",
        mixins: [mixins.skinBasedComp],

        getSkinProperties: function () {
            return {
                title: {
                    children: this.props.compProp.title
                },
                subtitle: {
                  children:   this.props.compProp.subtitle
                },
                description: {
                    dangerouslySetInnerHTML: {__html: this.props.compProp.description || ''}
                },
                tryButton: {
                    children: this.props.compProp.tryButton,
                    onClick: this.props.compProp.onTryCallback
                },
                upgradeButton: {
                    children: this.props.compProp.upgradeButton,
                    onClick: this.props.compProp.onUpgradeCallback
                },
                closeButton: {
                    onClick: this.props.compProp.onCloseCallback
                }

            };
        }
    };
});
