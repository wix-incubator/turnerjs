define([
        'lodash',
        'wixappsCore/proxies/mixins/baseProxy',
        'wixappsCore/core/typesConverter',
        'wixappsCore/util/localizer',
        'wixappsCore/util/richTextUtils',
        'reactDOM',
        'experiment'
    ],
    function (_, baseProxy, typesConverter, localizer, richTextUtils, ReactDOM, experiment) {
        'use strict';

        var unescapedElementsRegex = new RegExp(_.escape('<br/?>'), 'gi');

        function getLinkDataByQuery(getDataById, data, query) {
            var link = _.find(data.links, {linkId: query});
            return link ? typesConverter.link(link, getDataById) : null;
        }

        /**
         * @class proxies.mixins.textProxy
         * @extends proxies.mixins.baseProxy
         */

        return {
            mixins: [baseProxy],
            statics: {
                prefix: {type:'compProp', defaultValue: ''},
                postfix: {type:'compProp', defaultValue: ''},
                disableLinks: {type:'compProp', defaultValue: false},
                lineThrough: {type:'compProp', defaultValue: false},
                underline: {type:'compProp', defaultValue: false},
                singleLine: {type:'compProp', defaultValue: false},
                color: {type:'compProp', defaultValue: null},
                backgroundColor: {type:'compProp', defaultValue: null},
                noWrap: {type:'compProp', defaultValue: false},
                bold: {type:'compProp', defaultValue: false},
                italic: {type:'compProp', defaultValue: false},
                lineHeight: {type:'compProp', defaultValue: null},
                fontFamily: {type:'compProp', defaultValue: null},
                fontSize: {type:'compProp', defaultValue: null},
                showTooltip: {type:'compProp', defaultValue: false}
            },

            useSkinInsteadOfStyles: true,

            getInitialState: function () {
                return {showToolTip: false};
            },

            componentDidMount: function () {
                var domNode = ReactDOM.findDOMNode(this);
                var shouldShowToolTop = this.getCompProp('singleLine') && this.getCompProp('showTooltip') && domNode.scrollWidth > domNode.offsetWidth;
                if (shouldShowToolTop !== this.state.showToolTip) {
                    /*eslint react/no-did-mount-set-state:0*/
                    this.setState({showToolTip: shouldShowToolTop});
                }
            },

            createFormattedText: function (data, defaultElementTag) {
                if (data._type === "wix:RichText" || data._type === "wix:MediaRichText") {
                    var partVersion = this.props.viewProps.getPartDefinition().version;
                    return richTextUtils.getDataWithDefaultStyleForRichText(this.getCompProp, data, defaultElementTag, partVersion);
                }

                if (!_.isString(data)) {
                    data = _.isNumber(data) ? data.toString() : '';
                }

                if (experiment.isOpen('sv_limitAuthorLength')) {
                    var maxChars = this.getCompProp("max-chars");
                    if (maxChars) {
                        data = data.substring(0, maxChars);
                    }
                }

                var localizationBundle = this.props.viewProps.getLocalizationBundle();
                var translatedText = localizer.localize(data, localizationBundle);
                var escapedText = translatedText.replace(unescapedElementsRegex, _.unescape);
                var wrappedData = _.compact(['<hatul>', this.getCompProp("prefix"), escapedText, this.getCompProp("postfix"), '</hatul>']).join("");
                return richTextUtils.getDataWithDefaultStyleForString(this.getCompProp, wrappedData, defaultElementTag);
            },

            getDataByQuery: function (query) {
                var siteData = this.props.viewProps.siteData;
                return getLinkDataByQuery(siteData.getDataByQuery.bind(siteData), this.proxyData, query);
            },

            getRichTextChildCompProps: function (componentType, transformSkinPropertiesFunc) {
                var props = this.getChildCompProps(componentType, transformSkinPropertiesFunc);
                props.style = props.style || {};
                props.style.whiteSpace = this.getCompProp('noWrap') ? "nowrap" : "normal";

                // looks like it is being used only in non richtext types
                if (this.state.showToolTip) {
                    props.title = (this.getCompProp("prefix") || "" + this.proxyData + this.getCompProp("postfix") || "").replace(/\s+/mgi, ' ').replace(/^\s*/, '').replace(/\s*$/, '');
                }

                props.noAutoLinkGeneration = true;
                return props;
            }
        };
    }
);
