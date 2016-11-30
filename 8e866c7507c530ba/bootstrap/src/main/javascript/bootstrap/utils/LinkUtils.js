/**
 * @class core.managers.style.SkinParamMapper
 *
 * The core logic of the LinkableComponent, more flexible, as it decouples the target component (and his skin part
 * 'link') from the data which define link. (See, for example, PaginatedGridGallery).
 * In the near future, this code should be incorporated by the LinkableComponent trait
 */
define.Class('bootstrap.utils.LinkUtils', function(classDefinition){
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Commands', 'W.Config']);

    def.statics({
        linkType  : {
            SMS      : 'SMS',
            CALL     : 'CALL',
            SKYPE    : 'SKYPE',
            MAP      : 'MAP',
            EMAIL    : 'EMAIL',
            FACEBOOK : 'FACEBOOK',
            FLICKR   : 'FLICKR',
            BLOGGER  : 'BLOGGER',
            MYSPACE  : 'MYSPACE',
            LINKEDIN : 'LINKEDIN',
            TWITTER  : 'TWITTER',
            TUMBLR   : 'TUMBLR',
            YOUTUBE  : 'YOUTUBE',
            VIMEO    : 'VIMEO',
            PAGE     : 'PAGE',
            FREE_LINK: 'FREE_LINK',
            TEXT     : 'TEXT',
            DELICIOUS: 'DELICIOUS',
            WEBSITE  : 'WEBSITE',
            DOCUMENT : 'DOCUMENT',
            LOGIN    : 'LOGIN'
        },
        linkTarget: {
            SAME_WINDOW: '_self',
            NEW_WINDOW : '_blank'
        }

    });
    def.methods({
        linkifyElement: function(component, element, linkData, blockClickPropagation){
            this._fixTargetBug(linkData);
            var linkHref = linkData.get('href');
            var linkTarget = linkData.get('target');
            var linkType = linkData.get('linkType');
            if ((linkHref && linkTarget) || (linkType === 'LOGIN' || linkType === 'ADMIN_LOGIN')){
                this._createLink(component, element, linkType, linkHref, linkTarget);
                this._setLinkState(component);
                if (blockClickPropagation === true){
                    this._disableLinkClickPropagation(element);
                }
                if ((linkType === 'LOGIN' || linkType === 'ADMIN_LOGIN')){
                    var linkComponent = component._highlightedDisplayer.getLogic();
                    this._handleSpecialCases(linkComponent, linkType, element);
                }
            } else {
                this._removeLinkstate(component);
                element.set('href', "");
                element.setStyle('cursor', 'default');
                element.set('target', "");
                element.removeEvents('click');

            }
        },

        _createLink: function(component, element, linkType, linkHref, linkTarget){
            var isWebLinkToSameWindow = (linkTarget === '_self' && linkType === 'WEBSITE');
            if (this.resources.W.Config.env.isEditorInPreviewMode() && isWebLinkToSameWindow){
                this._bindPageLeaveWarningToLink(component, element);
            } else {
                element.set('href', linkHref);
                element.setStyle('cursor', 'pointer');
                element.set('target', linkTarget);
                element.removeEvents('click');
            }

        },

        _setLinkState: function(component){
            if (component.hasState("noLink", "linkableComponent")){
                component.removeState("noLink", "linkableComponent");
            }
        },

        _removeLinkstate: function(component){
            if (component.hasState("noLink", "linkableComponent")){
                component.setState("noLink", "linkableComponent");
            }
        },

        /*
         Fixes an old bug where target was set to 'same' of 'self' instead of '_self'
         */
        _fixTargetBug   : function(linkData){
            var linktarget = linkData.get('target');
            if (linktarget == 'same' || linktarget == 'self'){
                linktarget = '_self';
                linkData.set('target', '_self');
            }
        },

        _disableLinkClickPropagation: function(node){
            node.addEvent('click', function(e){
                e.stopPropagation();
            });
        },

        _bindPageLeaveWarningToLink: function(component, node){
            node.erase('href');
            node.erase('target');
            node.addEvent('click', function(e){
                e.preventDefault();
                this._showNavigationDisabledTooltip(component);
            }.bind(this));
        },

        _showNavigationDisabledTooltip: function(component){
            var params = { 'component': component };
            this.resources.W.Commands.executeCommand('linkableComponent.navigateSameWindow', params, component);
        },

        _handleSpecialCases: function(component, linktype, node){

            node.removeEvents('click');

            switch (linktype){
                case this.linkType.LOGIN:
                    node.addEvent("click", function(){
                        // animatedForm is defined in login.js
                        if (window['animateForm']){
                            var data = this.getDataItem();
                            var loginParamBag = data.get("text");
                            if (loginParamBag){
                                loginParamBag = JSON.parse(loginParamBag);
                                var postLoginUrl = loginParamBag['postLoginUrl'];
                                var postSignupUrl = loginParamBag['postSignupUrl'];
                                var type = loginParamBag['type'];
                                var htmlDimming = "HTML";

                                var isSessionValid = window['userApi'] ? window["userApi"].isSessionValid() : false;
                                if (!isSessionValid){

                                    window['animateForm']['callOnContent']([ postSignupUrl, postLoginUrl, type, htmlDimming]);
                                } else if (postLoginUrl){
                                    window.location.href = postLoginUrl;
                                }
                            }
                        }
                    }.bind(component));
                    break;

                case this.linkType.ADMIN_LOGIN:
                    node.setStyle('cursor', 'pointer');
                    node.addEvent("click", function(){
                        this.resources.W.Commands.executeCommand('WViewerCommands.AdminLogin.Open');
                    }.bind(component));
                    break;
            }
        }
    });

});
