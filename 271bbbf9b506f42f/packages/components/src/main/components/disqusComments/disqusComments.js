define(['core', 'utils', 'lodash', 'components/components/disqusComments/translations/disqusComments'], function (/** core */ core, /** utils */ utils, _, langKeys) {
    'use strict';

    var mixins = core.compMixins,
        urlUtils = utils.urlUtils,
        DEFAULT_DISQUS_ID = 'wixdemo123';


    /**
     * @class components.disqusComments
     * @extends {core.skinBasedComp}
     * @extends {core.postMessageCompMixin}
     * @extends {core.uniquePageIdMixin}
     */
    return {
        displayName: 'DisqusComments',
        mixins: [mixins.skinBasedComp, mixins.postMessageCompMixin, mixins.uniquePageIdMixin],

        /**
         * Uses 'editor' constant for editor or preview
         * Uses mixins.pageMetaInfoMixin.getUniquePageId for all other cases
         *
         * The main reason, why we use hashing here is because disqus comments seem to have problems with long disqus
         * identifiers
         *
         * @returns {string} SHA 256 hash
         */
        getDisqusInstanceId: function () {
            return (this.getDisqusId && this.getDisqusId()) ||
                this.getUniquePageId();
        },

        getIframeSrc: function () {
            var siteData = this.props.siteData;
            var pageId = siteData.getCurrentUrlPageId();
            var pageData = siteData.getDataByQuery(pageId, siteData.MASTER_PAGE_ID);
            var disqusIdentifier = this.getDisqusInstanceId(),
                iframeParams = {
                    'disqusId': this.props.compData.disqusId ? this.props.compData.disqusId : DEFAULT_DISQUS_ID,
                    'pageUrl': siteData.currentUrl.full,
                    'pageTitle': pageData.title,
                    'compId': this.props.id,
                    'disqusInstanceId': disqusIdentifier
                };

            return this.props.siteData.santaBase + '/static/external/disqusComments.html?' + urlUtils.toQueryString(iframeParams);
        },

        getSkinProperties: function () {
            var hasDisqusId = !!this.props.compData.disqusId;

            return {
                '': {
                    style: {
                        height: this.state.$disqusCommentsDesiredHeight ? this.state.$disqusCommentsDesiredHeight : ''
                    }
                },
                'disqusCommentsHolder': {
                    src: this.getIframeSrc(),
                    style: {
                        height: this.state.$disqusCommentsDesiredHeight ? this.state.$disqusCommentsDesiredHeight : ''
                    }
                },
                'disqusCommentsPreviewOverlay': {
                    style: {
                        display: 'none'
                    }
                },
                'noDisqusIdMessage': {
                    style: {
                        display: !hasDisqusId ? '' : 'none'
                    },
                    children: this.getTranslation('disqusComments_notDisqusIdMessage')
                }
            };
        },

        componentWillReceiveProps: function (nextProps) {
            this.setState({
                $disqusId: nextProps.compData.disqusId
            });
        },

        getTranslation: function (key) {
            return this.translatedKeys[key] || key;
        },

        getInitialState: function() {
            var siteData = this.props.siteData;
            var language = utils.wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl).toLowerCase() || 'en';
            this.translatedKeys = langKeys[language] || {};

            return {
                '$disqusId': this.props.compData.disqusId,
                '$disqusCommentsDesiredHeight': 200
            };
        },

        onDisqusCommentsHolderMsg: function (data) {
            this.prevHeight = this.state.$disqusCommentsDesiredHeight;

            this.setState({
                $disqusCommentsDesiredHeight: data.height
            });

            if (this.prevHeight !== data.height) {
                this.registerReLayout();
            }
        },

        componentDidMount: function () {
            this.setPostMessageHandler(this.props.id, this.onDisqusCommentsHolderMsg);
        }
    };
});
