define(['core'], function (/** core */core) {
    'use strict';

    var mixins = core.compMixins;

    function getOkButton() {
        var buttonData = {
            label: 'OK',
            id: 'ok'
        };
        var compProp = {
            align: 'center'
        };

        var skinPartName = 'okButton';

        return this.createChildComponent(
            buttonData,
            'wysiwyg.viewer.components.SiteButton',
            skinPartName,
            {
                skinPart: skinPartName,
                compProp: compProp,
                onClick: this.props.compProp.onCloseCallback
            }
        );
    }

    /**
     * @class components.MessageView
     */
    return {
        displayName: "MessageView",
        mixins: [mixins.skinBasedComp],

        getSkinProperties: function () {
            return {
                "": {
                    style: {
                        display: 'block',
                        position: 'absolute'
                    }
                },
                "blockingLayer": {

                },
                dialog: {},
                title: {
                    children: this.props.compProp.title
                },
                description: {
                    dangerouslySetInnerHTML: {__html: this.props.compProp.description || ''}
                },
                okButton: getOkButton.call(this)
            };
        }
    };
});