define([
    'lodash',
    'core',
    'components/components/dialogs/dialogMixin',
    'reactDOM'
], function(_, /** core */ core, dialogMixin, ReactDOM) {
    'use strict';

    /**
     * @class components.dialogs.CreditsDialog
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: "CreditsDialog",
        mixins: [core.compMixins.skinBasedComp, dialogMixin],
        componentDidMount: function () {
            ReactDOM.findDOMNode(this.refs.iframe).contentWindow.focus();
        },
        getSkinProperties: function () {

            if (this.shouldDialogBeClosed()) {
                return this.getCloseDialogSkinProperties();
            }

            return {
                blockingLayer: {
                    onClick: this.closeDialog
                },
                iframe: {
                    src: this.props.siteData.santaBase + '/static/external/credits/snake/snake.html'
                }
            };
        }
    };
});
