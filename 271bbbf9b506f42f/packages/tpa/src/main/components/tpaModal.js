define(['lodash', 'zepto', 'siteUtils', 'core',
    'tpa/mixins/tpaUrlBuilderMixin',
    'tpa/mixins/tpaCompApiMixin',
    'tpa/mixins/tpaRuntimeCompMixin',
    'tpa/mixins/tpaResizeWindowMixin'
], function(_, $, siteUtils, core, tpaUrlBuilderMixin, tpaCompApiMixin, tpaRuntimeCompMixin, tpaResizeWindowMixin) {

    'use strict';

    var compRegistrar = core.compRegistrar;
    var mixins = core.compMixins;
    var MIN_MARGIN = 50;

    /**
     * @class components.TPAModal
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @extends {tpa.mixins.tpaUrlBuilder}
     * @extends {tpa.mixins.tpaCompAPI}
     * @property {comp.properties} props
     */
    var TPAModal = {
        displayName: "TPAModal",

        mixins: [mixins.skinBasedComp, tpaUrlBuilderMixin, tpaCompApiMixin, tpaRuntimeCompMixin, tpaResizeWindowMixin, mixins.blockOuterScrollMixin],
        getInitialState: function() {
            this.props.siteAPI.getSiteAspect('windowResizeEvent').registerToResize(this);

            return {
                showComponent: true,
                registeredEvents: [],
                $displayDevice: this.getDeviceType(),
                windowSize: this.props.compData.windowSize
            };
        },

        getDefaultProperties: function () {
            return {
                "": {
                    style: {position: 'fixed', display: 'block'},
                    onWheel: this.blockOuterScroll
                },
                blockingLayer: {
                    onClick: this.hide
                },
                frameWrap: {
                    style: this.getIframeWrapperStyle()
                },
                dialog: {
                    style: this.getDialogStyle()
                },
                xButton: {
                    children: '×',
                    onClick: this.hide,
                    style: {display: 'block'}
                },
                'iframe': {
                    src: this.buildUrl(this.props.compData.url),
                    frameBorder: "0",
                    allowTransparency: true,
                    allowFullScreen: true,
                    name: this.props.id
                }
            };
        },

        getHiddenProperties: function () {
            return {
                "": {
                    style: {display: 'none'}
                }
            };
        },

        getBareProperties: function () {
            return _.merge(this.getDefaultProperties(), {
                frameWrap: {
                    style: {
                        background: 'transparent',
                        border: 'none'
                    }
                },
                xButton: {
                    style: {
                        display: 'none'
                    }
                }
            });
        },

        getSkinProperties: function() {
            if (this.state.showComponent) {
                switch (this.props.compData.theme) {
                    case 'BARE':
                    case 'LIGHT_BOX':
                        return this.getBareProperties();
                    default:
                        return this.getDefaultProperties();
                }
            }

            return this.getHiddenProperties();
        },

        getIframeWrapperStyle: function () {
            var isMobileView = this.props.siteData.isMobileView();
            var style = {};

            if (isMobileView) {
                style = {
                    'WebkitOverflowScrolling': 'touch',
                    'overflowY': 'scroll'
                };
            }

            return style;
        },

        getDialogStyle: function () {
            if (this.getDeviceType() === 'mobile') {
                return {};
            }

            var windowSize = this.state.windowSize;
            var width = _.isNumber(this.state.width) ? this.state.width : this.props.compData.width;
            var height = _.isNumber(this.state.height) ? this.state.height : this.props.compData.height;

            // Normalize to screen measurements
            width = Math.min(width, windowSize.width);
            height = Math.min(height, windowSize.height);

            var appData = this.getAppData();

            if (!appData.isWixTPA) {
                var minWidth = windowSize.width - MIN_MARGIN;
                var minHeight = windowSize.height - MIN_MARGIN;

                if (width >= minWidth && height >= minHeight){
                    width = minWidth;
                    height = minHeight;
                }
            }


            return {
                width: width,
                height: height,
                'marginTop': -height / 2,
                'marginLeft': -width / 2
            };
        },

        mutateIframeUrlQueryParam: function (queryParamsObj) {
            queryParamsObj.origCompId = this.props.compData.origCompId;

            return queryParamsObj;
        },

        hide: function (data, callback) {
            siteUtils.compFactory.invalidate('wysiwyg.viewer.components.tpapps.TPAModal');

            var self = this;
            this.setState({showComponent: false}, function() {
                var callBackData = data && data.message ? data : undefined;
                if (self.props.onCloseCallback) {
                    self.props.onCloseCallback(callBackData);
                }
                if (self.state.$displayDevice === 'mobile'){
                    self.props.siteAPI.exitFullScreenMode();
                }
                self.props.siteAPI.getSiteAspect('windowResizeEvent').unregisterToResize(self);

                self.props.siteAPI.getSiteAspect('tpaModalAspect').removeModal(self);

                if (_.isFunction(callback)) {
                    callback();
                }
            });
        },

        isBareTheme: function(){
            return this.props.compData.theme === "BARE";
        },

        onResize: function(){
            var $window = $(window);
            this.setState({
                windowSize: {
                    width: $window.width(),
                    height: $window.height()
                }
            });
        }
    };

    compRegistrar.register("wysiwyg.viewer.components.tpapps.TPAModal", TPAModal);
    return TPAModal;
});
