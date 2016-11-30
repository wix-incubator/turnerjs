define(['lodash', 'react', 'core', 'santaProps', 'textCommon/utils/filterHtmlString'], function (_, React, core, santaProps, filterHtmlString) {
    'use strict';

    /**
     * @class core.textCompMixin
     */

    return {

        propTypes: {
            reportBI: santaProps.Types.reportBI,
            id: santaProps.Types.Component.id.isRequired,
            skin: santaProps.Types.Component.skin.isRequired,
            style: santaProps.Types.Component.style.isRequired,
            structure: santaProps.Types.Component.structure.isRequired,
            title: React.PropTypes.string
        },

        mixins: [core.compMixins.skinBasedComp],
        componentWillMount: function () {
            this.updateHTML(this.props);
        },

        updateHTML: function(props) {
            this._componentHtml = filterHtmlString(props.compData.text || '', this.allowIframes, this.constructor.displayName, this.props.id, this.props.reportBI);
            this.convertCompDataTextToHTML(props);
        },

        componentWillReceiveProps: function (nextProps) {
            this.updateHTML(nextProps);
        },

        getRootStyle: function (style) {
            var styleWithoutHeight = _.clone(style || {});
            if ((styleWithoutHeight['overflow-y'] || styleWithoutHeight.overflowY) !== "hidden") {
                styleWithoutHeight.height = "auto";
            }
            return styleWithoutHeight;
        },

        getSkinProperties: function () {
            this.lastScale = _.get(this, 'props.structure.layout.scale') || 1;
            var skinName = this.props.skin;

            var refData = {
                "": {
                    style: this.getRootStyle(this.props.style)
                }
            };

            var textContainer;
            if (skinName === "wysiwyg.viewer.skins.WRichTextSkin" || skinName === "wysiwyg.viewer.skins.WRichTextClickableSkin") {
                textContainer = refData.richTextContainer = {};
            } else {
                textContainer = refData[""];
            }
            textContainer.dangerouslySetInnerHTML = {__html: this._componentHtml || ''};

            if (this.props.title) {
                refData[""].title = this.props.title;
            }

            var overrideAlignment = _.get(this.props, ['compProp', 'overrideAlignment']);
            if (overrideAlignment) {
                textContainer.className = this.classSet(_.zipObject(['override-' + overrideAlignment], [true]));
            }

            return refData;
        }
    };
});
