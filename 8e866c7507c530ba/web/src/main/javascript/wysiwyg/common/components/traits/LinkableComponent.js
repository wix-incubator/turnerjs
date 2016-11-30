define.Class('wysiwyg.common.components.traits.LinkableComponent', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Utils', 'W.Config']);

    def.binds(['_linkableComponentRender', '_linkify', 'renderLinks', '_showNavigationDisabledTooltip', '_linkableComponentEditModeChanged']);

    def.statics({
        linkType: {
            SMS: 'SMS',
            CALL: 'CALL',
            SKYPE: 'SKYPE',
            MAP: 'MAP',
            EMAIL: 'EMAIL',
            FACEBOOK: 'FACEBOOK',
            FLICKR: 'FLICKR',
            BLOGGER: 'BLOGGER',
            MYSPACE: 'MYSPACE',
            LINKEDIN: 'LINKEDIN',
            TWITTER: 'TWITTER',
            TUMBLR: 'TUMBLR',
            YOUTUBE: 'YOUTUBE',
            VIMEO: 'VIMEO',
            PAGE: 'PAGE',
            FREE_LINK: 'FREE_LINK',
            TEXT: 'TEXT',
            DELICIOUS: 'DELICIOUS',
            WEBSITE: 'WEBSITE',
            DOCUMENT: 'DOCUMENT',
            LOGIN: 'LOGIN',
            ADMIN_LOGIN: 'ADMIN_LOGIN'
        },
        linkTarget: {
            SAME_WINDOW: '_self',
            NEW_WINDOW:  '_blank'
        }
    });


    def.methods({
        initialize: function(){
            var linkUtils = this.resources.W.Utils.linkUtils;

            if(this.render && this.NEW_BASE_COMP !== true) {
                this._componentOriginalRender = this.render.bind(this);
                this.render = this._linkableComponentRender;
            } else if(this.NEW_BASE_COMP === true) {
                this.on(Constants.LifecycleSteps.RENDER, this, this._linkableComponentRender);
                this.on(Constants.EventDispatcher.Events.EXTERMINATING, this, this._exterminateLinkableComponent);
            }

            this._linkableComponentOnEditModeChanged = linkUtils.linkableComponentEditModeChanged.bind(this);
            this.injects().Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._linkableComponentOnEditModeChanged);
        },

        _exterminateLinkableComponent: function() {
            this.injects().Commands.unregisterListener(this);
        },

        _linkableComponentRender: function(){
            this._componentOriginalRender && this._componentOriginalRender();
            var linkUtils = this.resources.W.Utils.linkUtils;
            var dataItem = this.getDataItem();

            linkUtils.renderLinks.call(this, dataItem, this._skinParts["link"]);
            if(this.resources.W.Config.env.$isEditorViewerFrame){
                // if first render happens in preview mode, render links accordingly
                // this happens in galleries zoom mode, for instance
                linkUtils.linkableComponentEditModeChanged.call(this, 'PREVIEW', dataItem, this._skinParts["link"]);
            }
        },

        // render component links
        //
        // links are defined in the skin: <a skinPart="link">'
        // note that all elements within the <a> element must be <span> and NOT <div> element
        // this is due to the way Tomer Lichtash designed HTML
        // this method expects the component to extend the LinkDataSchema
        renderLinks: function() {
            var data = this.getDataItem();
            var linkhref = data.get('href');
            var linktarget = data.get('target');
            if (linktarget =='same' || linktarget == 'self') {
                linktarget = '_self';
                data.set('target', '_self');
            }
            var linktype = data.get('linkType');
            var linkableSkinPart = this._skinParts['link'];
            this._linkify(linktype, linkableSkinPart, linkhref, linktarget);
            if (this._NO_LINK_PROPAGATION) {
                this._disableLinkClickPropagation(linkableSkinPart);
            }
        },

        _disableLinkClickPropagation: function(node){
            node.addEvent('click', function(e){
                e.stopPropagation();
            });
        },

        // make a link of an <a> node
        // if href is empty, link is disabled and link cursor is removed
        _linkify: function (linktype, node, href, linktarget) {
            if (!node) {
                return;
            }

            if (href && href !== '') {
                node.set('href', href);
                node.setStyle('cursor', 'pointer');
                this._setTarget(node, linktarget);
                if(this.hasState("noLink", "linkableComponent")) {
                    this.removeState("noLink", "linkableComponent");
                }

            } else {
                node.setStyle('cursor', 'default');
                node.erase('href');
                node.erase('target');
                if(this.hasState("noLink", "linkableComponent")) {
                    this.setState("noLink", "linkableComponent");
                }
            }

            this._handleSpecialCases( linktype, node);
        },

        _handleSpecialCases: function( linktype, node) {

            node.removeEvents('click');

            switch (linktype) {
                case this.linkType.LOGIN:
                    node.addEvent("click", function() {
                        // animatedForm is defined in login.js
                        if (window['animateForm']) {
                            var data = this.getDataItem();
                            var loginParamBag = data.get("text");
                            if (loginParamBag) {
                                loginParamBag = JSON.parse ( loginParamBag );
                                var postLoginUrl = loginParamBag['postLoginUrl'];
                                var postSignupUrl = loginParamBag['postSignupUrl'];
                                var type = loginParamBag['type'];
                                var htmlDimming = "HTML";
                                if (postSignupUrl.indexOf('ifcontext') !== -1){
                                    var paramObj = this.resources.W.Utils.getQueryStringParamsAsObject();
                                    var target = '';
                                    _.forOwn(paramObj, function(value,key) {
                                        if (key.toLowerCase() === 'ifcontext') {
                                            target = value.replace('#','');
                                            if (/^[a-zA-Z0-9]+$/.test(target)) {
                                                postSignupUrl = postSignupUrl.replace('{ifcontext}',target);
                                            } else {
                                                postSignupUrl = postSignupUrl.replace('{ifcontext}','illegalContextValue');
                                            }
                                        }
                                    });
                                }
                                var isSessionValid = window['userApi'] ? window["userApi"].isSessionValid() : false ;
                                if (!isSessionValid) {

                                    window['animateForm']['callForm']([ postSignupUrl, postLoginUrl, type, htmlDimming]);
                                } else if (postLoginUrl) {
                                    window.location.href = postLoginUrl;
                                }
                            }
                        }
                    }.bind(this));
                    break;

                case this.linkType.ADMIN_LOGIN:
                    node.setStyle('cursor', 'pointer');
                    node.addEvent("click", function() {
                        this.injects().Commands.executeCommand('WViewerCommands.AdminLogin.Open');
                    }.bind(this));
                    break;
            }
        },

        _setTarget: function(node, target) {
            node.set('target', target);
        },

        // handle edit mode change
        // when in editor preview mode, all links will open a new window regardless of the real target
        _linkableComponentEditModeChanged: function(editorMode) {
            if(this.getIsDisposed() === true) {
                return;
            }

            var node;
            var warnPageLeave = false;
            var disableWarningForMailto = false;
            var data = this.getDataItem();
            var linktype = data.get('linkType');
            var linktarget = data.get('target');

            if (linktarget == this.linkTarget.SAME_WINDOW && linktype == this.linkType.WEBSITE) {
                warnPageLeave = true;
            }

            // for mailto links, page leave warning must be disabled for a few milliseconds
            if (linktype == this.linkType.EMAIL) {
                disableWarningForMailto = true;
            }

            node = this._skinParts['link'];
            // toggle links

            if (editorMode == 'PREVIEW'){
                if (warnPageLeave) {
                    this._bindPageLeaveWarningToLink(node);
                }
                else if (disableWarningForMailto) {
                    this._bindMailtoLinks();
                    this.renderLinks();
                }
            } else {
                node.removeEvents('click');
                this.renderLinks();
            }

        },

        _bindMailtoLinks: function () {
            var node = this._skinParts['link'];
            node.addEvent('click', this._temporaryDisableNavigationWarning);
        },

        _temporaryDisableNavigationWarning: function (e) {
            window.enableNavigationConfirmation = false;
            setTimeout(function() {
                window.enableNavigationConfirmation = true;
            }, 50);
        },

        _bindPageLeaveWarningToLink: function (node){
            node.erase('href');
            node.erase('target');
            node.addEvent('click', function(e) {
                e.preventDefault();
                this._showNavigationDisabledTooltip();
            }.bind(this));
        },

        _showNavigationDisabledTooltip: function() {
            var params = { component: this };
            this.injects().Commands.executeCommand('linkableComponent.navigateSameWindow', params, this);
        }

    });
});