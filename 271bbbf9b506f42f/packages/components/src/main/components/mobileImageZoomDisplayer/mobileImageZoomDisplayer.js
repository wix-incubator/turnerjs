define(['lodash', 'core', 'utils', 'imageClientApi'], function (_, /** core */ core, /** utils */ utils, imageClientApi) {
    'use strict';

    var mixins = core.compMixins;
    var linkRenderer = utils.linkRenderer;

    var translatedLanguageKeys = { // TODO: add i18n bundle and move to another model if it's the same for both models
        goToLinkText: 'Go to link'
    };

    /**
     * @class components.MobileMediaZoomDisplayer
     * @extends {core.skinBasedComp}
     */
    var MobileImageZoomDisplayer = {
        displayName: 'MobileImageZoomDisplayer',

        mixins: [mixins.skinBasedComp],

        getInitialState: function () {
            return {
                $panelState: this.hasTitleOrDescription() ? '' : 'hidePanel',
                $descriptionState: ''
            };
        },

        getSkinProperties: function () {
            var compData = this.props.compData;
            var compProps = this.props.compProp;
            var siteData = this.props.siteData;
            var zoomDimensions = this.props.zoomDimensions;

            var refs = {
                title: {
                    children: compData.title
                },
                description: {
                    children: compData.description,
                    style: {
                        height: 'auto'
                    }
                },
                ellipsis: {
                    style: {
                        display: 'none'
                    }
                },
                //force jpg compression to 90 on zoom mode
                image: this.createChildComponent(compData, 'core.components.Image', 'image', {
                    key: compData.id,
                    id: this.props.id + 'image',
                    ref: 'image',
                    imageData: compData,
                    quality: this.props.quality,
                    containerWidth: zoomDimensions.imageContainerWidth,
                    containerHeight: zoomDimensions.imageContainerHeight,
                    displayMode: imageClientApi.fittingTypes.LEGACY_FULL,
                    onClick: this.togglePanel,
                    effectName: this.props.compProp.effectName,
                    usePreloader: true
                })
            };

            if (compData.description) {
                refs.description.onSwipeUp = this.expandDescription;
                refs.description.onSwipeDown = this.collapseDescription;
                refs.title.onClick = this.toggleDescription;
                refs.description.onClick = this.toggleDescription;
            } else {
                refs.description.style = {
                    display: 'none'
                };
            }

            if (compData.link) {
                refs.link = linkRenderer.renderLink(compData.link, siteData, this.props.rootNavigationInfo);
                refs.link.children = (compProps && compProps.goToLinkText) ? compProps.goToLinkText : translatedLanguageKeys.goToLinkText;
            } else {
                refs.link = {
                    style: {
                        display: 'none'
                    }
                };
            }

            return refs;
        },

        /**
         * Handle image click ( we're basically toggling the panel
         * & calling the mobile media zoom callbacks )
         */
        togglePanel: function () {
            if (this.isPanelHidden()) {
                this.props.showMediaZoomButtons();
                if (this.hasTitleOrDescription()) {
                    this.showPanel();
                }

            } else {
                this.props.hideMediaZoomButtons();
                this.hidePanel();
            }
        },

        /**
         * Handle title/description click ( we're basically expanding/collapsing the description &
         * calling the mobile media zoom callbacks )
         */
        toggleDescription: function () {
            if (this.isDescriptionExpanded()) {
                this.collapseDescription();
            } else {
                this.expandDescription();
            }
        },

        /**
         * Checks if image contains title or description
         * @returns {boolean}
         */
        hasTitleOrDescription: function () {
            return this.props.compData.title || this.props.compData.description;
        },

        /**
         * Checks is the panel is hidden
         * @returns {boolean}
         */
        isPanelHidden: function () {
            return this.state.$panelState === 'hidePanel';
        },

        /**
         * Shows the panel
         */
        showPanel: function () {
            this.setState({$panelState: ''});
        },

        /**
         * Hides the panel
         */
        hidePanel: function () {
            this.setState({$panelState: 'hidePanel'});
        },

        /**
         * Checks if the description is expanded
         * @returns {boolean}
         */
        isDescriptionExpanded: function () {
            return this.state.$descriptionState === 'expandedDescription';
        },

        /**
         * Expands the description
         */
        expandDescription: function () {
            this.props.hideMediaZoomButtons();
            this.setState({$descriptionState: 'expandedDescription'});
        },

        /**
         * Collapses the description
         */
        collapseDescription: function () {
            this.props.showMediaZoomButtons();
            this.setState({$descriptionState: ''});
        }
    };

    return MobileImageZoomDisplayer;
});
