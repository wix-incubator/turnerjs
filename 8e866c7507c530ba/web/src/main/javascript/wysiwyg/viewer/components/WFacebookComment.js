/**
 * @class wysiwyg.viewer.components.WFacebookComment
 */
define.component('wysiwyg.viewer.components.WFacebookComment', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Utils', 'W.Viewer', 'W.TPA', 'W.Config', 'W.Commands']);

    def.propertiesSchemaType('WFacebookCommentProperties');

    def.skinParts({
        facebook: {type: 'htmlElement'}
    });

    def.states({
        'EDITOR': ['light', 'dark'],
        'VIEWER': ['scriptLoading', 'scriptLoaded', 'loading', 'idle', 'disabled'],
        'displayDevice': ['mobileView']
    });

    def.binds(['_onResizeEnd', '_onFacebookComponentRender', '_checkIframeSize', '_renderComponentOnViewer', '_rebuildFacebookComponent']);

    def.fields({
        WIDTH: {
            MOBILE: 280,
            DESKTOP: 400
        }
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false,
                animation: false
            }
        }
    });

    def.methods({

        initialize: function (compId, viewNode) {
            this.parent(compId, viewNode);
            this.addEvent('resizeEnd', this._onResizeEnd);
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditorModeChanged);
            this._resizableSides = [Constants.BaseComponent.ResizeSides.RIGHT, Constants.BaseComponent.ResizeSides.LEFT];

            this.resources.W.Utils.hash.addEvent('change', function () {
                // When hash changes we need to update the href property
                this.callRenderLater(500);
            }.bind(this));

            this._iframeOldHeight = 0;

            this._isMobileView = false;
            if (this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this._isMobileView = true;
                this.setState("mobileView", "displayDevice");
                this._resizableSides = [];
            }
        },

        render: function () {
            this._createClickOverlay(); // will create only once, don't worry.
            this._renderComponent();
        },

        isDomDisplayReadyOnReady: function () {
            return false;
        },

        _onEditorModeChanged: function (newMode, oldMode) {
            if (newMode === "PREVIEW" || oldMode === "PREVIEW") {
                this._renderComponent();
            }
        },

        _onResizeEnd: function () {
            if (this._skinParts) {
                this.setComponentProperty('width', this.getWidth());
                this._renderComponent();
            }
        },

        /*
         rebuild Facebook's fb:like element, so the like button could be updated with new
         properties.

         overrides SocialComponentBase that usually creates an IFrame.
         */
        _renderComponent: function () {
            if (this.resources.W.Config.env.$isPublicViewerFrame || !Browser.ie) {
                this._renderComponentOnViewer();
            } else {
                this._renderComponentOnEditor();
            }
        },

        _renderComponentOnEditor: function () {
            var colorScheme = this.getComponentProperty('colorScheme');
            this.setState(colorScheme, "editor");
        },

        _renderComponentOnViewer: function () {
            var currPhase = this.getState("viewer");
            if (!currPhase) { // first time
                this.setState("scriptLoading", "viewer");

                this._loadScript(function () {
                    this.setState("scriptLoaded", "viewer");
                }.bind(this));

                this.callRenderLater();
                return false;
            }
            if (currPhase == 'loading' || currPhase == "scriptLoading") {
                this.callRenderLater();
                return false;
            }


            if (!this.getComponentProperty('canBeShownOnAllPagesBug')) {
                //backward compatibility
                this.setState("loading", "viewer");
                this._rebuildFacebookComponent();
            } else {
                //if current page is not ready - don't change state - wait for next timeout until current page is ready
                if (this.resources.W.Viewer.getCurrentPageId() !== null) {
                    this.setState("loading", "viewer");
                    this._rebuildFacebookComponent();
                }
            }
        },

        _onScriptLoaded: function () {
            this.setState("scriptLoaded", "viewer");
            if (!this.getComponentProperty('canBeShownOnAllPagesBug')) {
                //backward compatibility
                this.setState("loading", "viewer");
                this._rebuildFacebookComponent();
            } else {
                //if current page is not ready - don't change state - wait for next timeout until current page is ready
                if (this.resources.W.Viewer.getCurrentPageId() != null) {
                    this.setState("loading", "viewer");
                    this._rebuildFacebookComponent();
                }
            }
        },

        _rebuildFacebookComponent: function () {
            var width = this.getComponentProperty('width');
            if (this._isMobileView) {
                width = this.WIDTH.MOBILE;
            }

            var fbHref = this._getFacebookHref();
            this._skinParts.facebook.empty();

            var newFbCommentElementProperties = {
                'class': 'fb-comments',
                'data-href': fbHref,
                'data-num-posts': this.getComponentProperty('numPosts'),
                'data-width': width,
                'data-colorscheme': this.getComponentProperty('colorScheme'),
                'mobile': false
            };

            this._fbCommentElement = new Element('DIV', newFbCommentElementProperties);

            this._fbCommentElement.insertInto(this._skinParts.facebook);

            if (window['FB'] && FB.XFBML && FB.XFBML.parse) {
                FB.XFBML.parse(this._skinParts.facebook);
            }

            if (
                this.resources.W.Config.getDocumentType().toLowerCase() === "template" &&
                this.resources.W.Config.env.$isPublicViewerFrame
            ) {
                this.setState("disabled", "viewer");
            } else {
                this.setState("idle", "viewer");
            }

            this._view.fireEvent(Constants.ComponentEvents.DOM_DISPLAY_READY);
        },

        appendPageHash: function (href) {
            var hashParts = this.resources.W.Utils.hash.getHashParts(window.location.hash);
            var hash = hashParts.extData || '';

            // No hash, return href as is
            if (hash === '') {
                return href;
            }

            // Append hash to href
            if (this.resources.W.Utils.strEndsWith(href, '#!' + hash)) {
                // do nothing ig hash is already there
            } else if (this.resources.W.Utils.strEndsWith(href, '/#')) {
                href += '!' + hash;
            } else if (this.resources.W.Utils.strEndsWith(href, '/')) {
                href += '#!' + hash;
            } else {
                href += '/#!' + hash;
            }
            return href;
        },

        _getFacebookHref: function () {
            var href;
            if (this.resources.W.Config.env.$isPublicViewerFrame) {
                href = location.href;
                if (this.resources.W.Viewer.isHomePage()) {
                    //append page hash for backward compatibility with facebook like counter, the home page used to have the page hash
                    href = this.appendPageHash(href);
                }
            } else if (
                this.resources.W.Config.env.$isEditorViewerFrame ||
                this.resources.W.Config.env.$isEditorFrame
            ) {
                href = this.resources.W.Config.getUserPublicUrl();
            } else {
                href = "http://www.wix.com/create/website";
            }
            return href;
        },

        _onFacebookComponentRender: function () {
            if (!this.isReady()) {
                return;
            }

            var size = this._skinParts.facebook.getSize();
            var elemHeight = size.y;
            this.setHeight(elemHeight);
            this._wCheckForSizeChangeAndFireAutoSized(1);
        },

        dispose: function () {
            if (this._iframeAuditor) {
                clearInterval(this._iframeAuditor);
            }
            if (window['FB']) {
                FB.Event.unsubscribe('xfbml.render', this._onFacebookComponentRender);
                FB.Event.subscribe('comment.create', this._onFacebookComponentRender);
                FB.Event.subscribe('comment.remove', this._onFacebookComponentRender);
            }

            this.parent();
        },


        /*
         overrides WBaseComponent (wysiwyg): FacebookLike has a minumum width, so we will not allow to narrow
         the size of the component to be less than that
         */
        setWidth: function (value, forceUpdate, triggersOnResize) {
            var minimumFacebookLikeWidth;
            if (this._isMobileView) {
                minimumFacebookLikeWidth = this.WIDTH.MOBILE;
            } else {
                minimumFacebookLikeWidth = this.WIDTH.DESKTOP;
            }

            if (value >= minimumFacebookLikeWidth) {
                this.parent(value, forceUpdate, triggersOnResize);
            }
            else {
                this.parent(minimumFacebookLikeWidth, forceUpdate, triggersOnResize);
            }
        },

        _checkIframeSize: function () {
            if (!this.isReady()) {
                return;
            }

            var iframe = this._skinParts.facebook.getElement("iframe");
            if (iframe) {
                var iframeHeight = iframe.getSize().y;
                if (this._iframeOldHeight != iframeHeight) {
                    this._iframeOldHeight = iframeHeight;
                    this._onFacebookComponentRender();
                }
            }
        },

        /*
         built in script from Facebook, enables facebook's script
         see: https://developers.facebook.com/docs/javascript/quickstart/v2.2
         */
        _loadScript: function (onScriptLoaded) {
            var appId = '304553036307597';

            if (!define.getDefinition('resource', 'FacebookApi')) {
                define.resource('FacebookApi').withUrls('//connect.facebook.net/' + this._getFacebookSdkLanguage() + '/sdk.js');
            }

            resource.getResourceValue('FacebookApi', function () {

                FB.Event.subscribe('xfbml.render', this._onFacebookComponentRender);
                FB.Event.subscribe('comment.create', this._onFacebookComponentRender);
                FB.Event.subscribe('comment.remove', this._onFacebookComponentRender);

                this._iframeAuditor = setInterval(function () {
                    this._checkIframeSize();
                }.bind(this), 500);

                FB.init({
                    appId: appId,
                    xfbml: 1,
                    version: 'v2.3'
                });

                onScriptLoaded();

            }.bind(this));
        },
        _getFacebookSdkLanguage: function () {
            var languageDecode = {
                en: 'en_US',
                es: 'es_ES',
                pt: 'pt_BR',
                ru: 'ru_RU',
                fr: 'fr_FR',
                de: 'de_DE',
                ja: 'ja_JP',
                ko: 'ko_KR',
                it: 'it_IT',
                pl: 'pl_PL',
                tr: 'tr_TR',
                nl: 'nl_NL',
                sv: 'sv_SE',
                no: 'nn_NO'
            };
            // browserLanguage in IE10 and lower
            var languageCode = navigator && (navigator.language || navigator.browserLanguage);
            if (languageCode.indexOf('-') > -1) {
                languageCode = languageCode.replace('-', '_');
                return languageCode;
            }
            languageCode = languageDecode[languageCode] || 'en_US';
            return languageCode;
        }

    });
});
