define(['lodash', 'santaProps', 'utils', 'core', 'buttonCommon'], function (_, santaProps, utils, core, buttonCommon) {
    'use strict';

    var SantaTypes = santaProps.Types;
    var mixins = core.compMixins;
    var baseEditorUrl = "http://editor.wix.com/html/editor/web/renderer/edit/";

    function createSessionGUID() {
        return utils.guidUtils.getGUID();
    }

    function getEditorUrl(siteId, metaSiteId) {
        var editorSessionId = createSessionGUID();
        return baseEditorUrl + siteId + "?metaSiteId=" + metaSiteId + "&editorSessionId=" + editorSessionId;
    }

    return {
        displayName: 'AdminLoginButton',
        mixins: [
            mixins.skinBasedComp,
            mixins.animationsMixin,
            buttonCommon.buttonMixin
        ],
        propTypes: {
            compData: SantaTypes.Component.compData.isRequired,
            style: SantaTypes.Component.style.isRequired,
            siteId: SantaTypes.RendererModel.siteId.isRequired,
            metaSiteId: SantaTypes.RendererModel.metaSiteId.isRequired
        },
        statics: {
            useSantaTypes: true
        },
        getSkinProperties: function () {
            var skinProps = {
                label: {
                    style: _.merge(
                        this.getLabelStyle(),
                        {lineHeight: utils.style.unitize(this.props.style.height)}
                    ),
                    children: [this.props.compData.label]
                },
                link: {
                    target: '_self',
                    href: getEditorUrl(this.props.siteId, this.props.metaSiteId)
                }
            };

            this.resetMinHeightIfNeeded(skinProps);
            return skinProps;
        }
    };
});
