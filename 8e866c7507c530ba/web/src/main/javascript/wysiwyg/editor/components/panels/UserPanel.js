define.component('wysiwyg.editor.components.panels.UserPanel', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.binds(['_getUserDetails', '_initAngularModule', '_onPostInFacebookClick', '_onTweetInTwitterClick', '_openRestoreToTemplateConfirmationDialog', '_onSave', '_onPublish', '_reportEvent', '_collapse','_handleLinkClick']);

    def.resources(['W.Resources', 'scriptLoader', 'W.EditorDialogs', 'W.Utils']);

    def.skinParts({
        container: {type:'htmlElement'}
    });

    def.utilize(['core.managers.serverfacade.RESTClient']);

    def.statics({
        DIALOG_ARGS: {
            icon: {x: 0, y: 0, width: 85, height: 70,  url:"mobile/props_not_connected.png"},
            title: 'USER_PANEL_RESTORE_TO_TEMPLATE_DIALOG_TITLE',
            description: 'USER_PANEL_RESTORE_TO_TEMPLATE_DIALOG_FIRST_LABEL',
            buttonSet: [
                {
                    label: 'USER_PANEL_START_OVER',
                    color: Constants.DialogWindow.BUTTON_COLOR.BLUE,
                    align: Constants.DialogWindow.BUTTON_ALIGN.RIGHT
                },
                {
                    label: 'USER_PANEL_NO_THANKS',
                    color: Constants.DialogWindow.BUTTON_COLOR.GRAY,
                    align: Constants.DialogWindow.BUTTON_ALIGN.LEFT
                }
            ]
        },
        _userDetailsUrl: "/_api/wix-html-login-webapp/user/getUserDetails",
        _userImageURL: '/_api/account-info-server/profileimage',
        _siteStates: {
            DRAFT: {
                stateName: 'draft',
                locale: 'USER_PANEL_SITE_STATUS_DRAFT'
            },
            SAVED: {
                stateName: 'saved',
                locale: 'USER_PANEL_SITE_STATUS_SAVED'
            },
            PUBLISHED: {
                stateName: 'published',
                locale: 'USER_PANEL_SITE_STATUS_PUBLISHED'
            }
        },
        _events: {
            USER_PANEL_ACCOUNT_SETTINGS: {
                'desc': 'User clicked on Account Settings in User Panel',
                'type': 40, // replace l.type.userAction
                'category': 1, // replace with l.category.editor
                'biEventId': 111,
                'biAdapter': 'hed-misc'
            },
            USER_PANEL_RESTORE_TO_TEMPLATE: {
                'desc': 'User clicked on Restore to Template in User Panel',
                'type': 40, // replace l.type.userAction
                'category': 1, // replace with l.category.editor
                'biEventId': 112,
                'biAdapter': 'hed-misc'
            },
            USER_PANEL_EXIT: {
                'desc': 'User closed User Panel with Exit option',
                'type': 40, // replace l.type.userAction
                'category': 1, // replace with l.category.editor
                'biEventId': 113,
                'biAdapter': 'hed-misc'
            },
            USER_PANEL_PUBLISH_SITE: {
                'desc': 'User published site via User Panel',
                'type': 40, // replace l.type.userAction
                'category': 1, // replace with l.category.editor
                'biEventId': 114,
                'biAdapter': 'hed-misc'
            },
            USER_PANEL_MANAGE_SITE: {
                'desc': 'User clicked Manage Site in User Panel',
                'type': 40, // replace l.type.userAction
                'category': 1, // replace with l.category.editor
                'biEventId': 115,
                'biAdapter': 'hed-misc'
            },
            USER_PANEL_PROMOTE_FACEBOOK: {
                'desc': 'User clicked Promote to Facebook via User Panel',
                'type': 40, // replace l.type.userAction
                'category': 1, // replace with l.category.editor
                'biEventId': 116,
                'biAdapter': 'hed-misc'
            },
            USER_PANEL_PROMOTE_TWITTER: {
                'desc': 'User clicked Promote to Twitter via User Panel',
                'type': 40, // replace l.type.userAction
                'category': 1, // replace with l.category.editor
                'biEventId': 116,
                'biAdapter': 'hed-misc'
            },
            USER_PANEL_SAVE_SITE: {
                'desc': 'User clicked Save via User Panel',
                'type': 40, // replace l.type.userAction
                'category': 1, // replace with l.category.editor
                'biEventId': 117,
                'biAdapter': 'hed-misc'
            }
        }
    });

    def.states({
        siteState: ['draft', 'saved', 'published'],
        visibility: ['visible', 'hidden']
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            if (this._isIE() || this._isFB()) {
                return;
            }

            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.ToggleEditorUserPanel', this, this._toggleUserPanel);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._collapse);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._collapse);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.Save', this, this._collapse);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.OpenPublishDialog', this, this._collapse);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.FirstSaveComplete', this, this._onSaveComplete);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.PublishComplete', this, this._onPublishComplete);

            if (this._getSiteState() === this._siteStates.PUBLISHED.stateName) {
                this._initFacebookSDK();
            }
        },

        _isIE: function() {
            return this.resources.W.Utils.getInternetExplorerVersion() === 9;

        },

        _isFB: function() {
            return this.resources.W.Config.getApplicationType() == Constants.WEditManager.SITE_TYPE_FACEBOOK;
        },

        isRenderNeeded: function (invalidations) {
            return invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER]) ;
        },

        _onRender: function(renderEvent) {
            if (this._isIE() || this._isFB()) {
                return;
            }

            var invalidations = renderEvent.data.invalidations;
            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._restClient = new this.imports.RESTClient();
                this._restClient.get('http://' + window.location.host + this._userDetailsUrl, {}, {
                    'onSuccess': function (appData) {
                        this._restClient.get('http://' + window.location.host + this._userImageURL, {}, {
                            'onSuccess': function (imageData) {
                                var combinedData = appData;
                                this._initAngularModule(combinedData);
                            }.bind(this)
                        });
                    }.bind(this)
                });
                this.setState('hidden', 'visibility');
            }
        },

        _initAngularModule: function(appData) {
            var $this = this;
            var initModule = function() {
                var app = window.angular.module('EditorUserPanel', []);

                app.value('LinksData', {
                    myAccount: {
                        label: $this._translate('USER_PANEL_MY_ACCOUNT'),
                        url: $this._translateUrl('USER_PANEL_MY_ACCOUNT_LINK'),
                        openInNewTab: true,
                        biEvent: 'USER_PANEL_ACCOUNT_SETTINGS',
                        id: 'myAccountLink'
                    },
                    exitEditor: {
                        label: $this._translate('USER_PANEL_EXIT_EDITOR'),
                        url: $this._translateUrl('USER_PANEL_EXIT_EDITOR_LINK'),
                        openInNewTab: false,
                        biEvent: 'USER_PANEL_EXIT',
                        id: 'exitEditorLink'
                    },
                    manageMySite: {
                        label: $this._translate('USER_PANEL_MANAGE_MY_SITE'),
                        url: $this._translateUrl('USER_PANEL_MANAGE_MY_SITE_LINK') + '?view=site&metaSiteId=',
                        openInNewTab: true,
                        biEvent: 'USER_PANEL_MANAGE_SITE',
                        id: 'manageSiteLink'
                    },
                    restoreTemplate: {
                        label: $this._translate('USER_PANEL_RESTORE_TO_TEMPLATE'),
                        url: '#',
                        biEvent: 'USER_PANEL_RESTORE_TO_TEMPLATE',
                        id: 'restoreTemplateLink'
                    },
                    social: {
                        label: $this._translate('USER_PANEL_SHARE_TITLE'),
                        services: {
                            facebook: { label: $this._translate('USER_PANEL_SOCIAL_SERVICE_FACEBOOK') },
                            twitter: { label: $this._translate('USER_PANEL_SOCIAL_SERVICE_TWITTER') }
                        }
                    }
                });

                app.value('UserPanelLanguage', {
                    PUBLISH_YOUR_SITE: $this._translate('USER_PANEL_PUBLISH_SITE'),
                    SAVE_YOUR_SITE: $this._translate('USER_PANEL_SAVE_SITE'),
                    MY_SITE: $this._translate('USER_PANEL_MY_SITE')
                });

                app.controller('UserPanelCtrl', ['$scope', 'LinksData', 'UserPanelLanguage', function ($scope, LinksData, UserPanelLanguage) {

                    $this.addEvent('dataChanged', function(params) {
                        LinksData.manageMySite.url = 'http://www.wix.com/my-account?view=site&metaSiteId=' + window.editorModel.metaSiteId;
                        $scope.render(params);
                    });

                    $scope.$this = $this;
                    $scope.links = LinksData;
                    $scope.langs = UserPanelLanguage;
                    $scope.user = $this._getUserDetails(appData.payload);
                    $scope.siteStatus = $scope.$this._translate($this._getSiteStateLocale());

                    $scope.siteState = $this._getSiteState();
                    $scope.isPublished = $scope.siteState === 'published';
                    $scope.isSaved = $scope.siteState === 'saved';
                    $scope.isDraft = $scope.siteState === 'draft';
                    $scope.showTooltip = false;

                    if ($scope.isDraft) {
                        $scope.user.url += $scope.langs.MY_SITE;
                        $scope.user.url = $scope.user.url.replace('http://','');
                    } else {
                        $scope.originalUrl = $scope.originalUrl || $scope.user.url;
                        $scope.user.url = $this._truncateUrl($scope.user.url, 28);
                    }

                    $scope.render = function(params) {
                        if (!params || !params.isPublished) {
                            $scope.siteState = $scope.$this._getSiteState();
                            $scope.siteStatus = $scope.$this._translate($this._getSiteStateLocale());
                            $scope.isPublished = $scope.siteState === 'published';
                            $scope.isSaved = $scope.siteState === 'saved';
                            $scope.isDraft = $scope.siteState === 'draft';
                        } else {
                            // override window.editorModel data after publish
                            $scope.siteState = 'published';
                            $scope.siteStatus = $scope.$this._translate('USER_PANEL_SITE_STATUS_PUBLISHED');
                            $scope.isPublished = true;
                            $scope.isSaved = false;
                            $scope.isDraft = false;
                        }

                        $scope.options = $scope.$siteStateMenuOptions[$scope.siteState];
                        $scope.originalUrl = window.top.editorModel.publicUrl;
                        $scope.user.url = $this._truncateUrl($scope.originalUrl, 28);

                        $scope.$digest();
                    };

                    $scope.reportEvent = $this._reportEvent;
                    $scope.onPublish = $this._onPublish;
                    $scope.onSave = $this._onSave;
                    $scope.handleLinkClick = $this._handleLinkClick;
                    $scope.publishToFacebook = $this._onPostInFacebookClick;
                    $scope.publishToTwitter = $this._onTweetInTwitterClick;
                    $scope.restoreToTemplate = $this._openRestoreToTemplateConfirmationDialog;

                    // options by siteState
                    $scope.$siteStateMenuOptions = {
                        draft: {
                            siteUrl: $scope.user.siteUrl
                        },
                        saved: {
                            siteUrl: $scope.user.siteUrl,
                            manageMySite: LinksData.manageMySite
                        },
                        published: {
                            siteUrl: $scope.user.siteUrl,
                            manageMySite: LinksData.manageMySite
                        }
                    };

                    $scope.options = $scope.$siteStateMenuOptions[$scope.siteState];
                }]);

                app.directive('bgImage', function() {
                    return function(scope, element, attrs) {
                        var url = attrs.bgImage;
                        element.css({
                            'background-image': 'url(' + url +')',
                            'background-size' : 'cover'
                        });
                    };
                });

                app.directive('exorcism', ['$timeout', function(timer) {
                    var linker = function(scope, element, attrs) {
                        var data = {
                            className: '.' + attrs['exorcism'],
                            el: element
                        };
                        var exorcise = function() {
                            this.el.css('display', 'block');
                        }.bind(data);
                        timer(exorcise, 0);
                    };
                    return {
                        link: linker
                    };
                }]);

                $this._bootstrapAngular();
            };

            resource.getResources(['angularResource'], function(resources) {
                resources.angularResource.Resource({
                    'scriptloader': $this.resources.scriptLoader,
                    'onComplete': initModule
                });
            });
        },

        _truncateUrl: function(url, maxLength) {
            var truncatedUrl;

            if (url.indexOf('.wix.com') > -1 && url.indexOf('@') === -1) {
                truncatedUrl = url.replace('http://','').replace('www.','');
            } else {
                truncatedUrl = url;
            }

            if (truncatedUrl.length > maxLength) {
                truncatedUrl = truncatedUrl.substring(0, maxLength) + '...';
            }

            return truncatedUrl;
        },

        _bootstrapAngular: function() {
            var contentNode = this.getSkinPart('container');
            window.angular.bootstrap(contentNode, ['EditorUserPanel']);
        },

        _openRestoreToTemplateConfirmationDialog: function(e) {
            e.preventDefault();
            this.resources.W.EditorDialogs.openPromptDialog(this._translate(this.DIALOG_ARGS.title), this._translate(this.DIALOG_ARGS.description), null, this.DIALOG_ARGS.buttonSet, function(e) {
                if (e.result !== 'USER_PANEL_NO_THANKS') {
                    window.location.reload();
                }
            });

            LOG.reportEvent(this._events.USER_PANEL_RESTORE_TO_TEMPLATE);
        },

        _reportEvent: function(eventId, params) {
            LOG.reportEvent(this._events[eventId], params);
        },

        _handleLinkClick: function(e,linkData) {
            e.preventDefault();
            this._reportEvent(linkData.biEvent);
            if(linkData.url) {
                if(linkData.openInNewTab) {
                    window.open(linkData.url, "_blank");
                } else {
                    /* Using location because otherwise using window.open causes a bug, it leaves a reference to an object */
                    window.location = linkData.url;
                }
            }
        },

        _onPublish: function(e) {
            e.preventDefault();
            this._initFacebookSDK();
            this.resources.W.Commands.executeCommand('WEditorCommands.OpenPublishDialog');
            this._reportEvent('USER_PANEL_PUBLISH_SITE');
        },

        _onSave: function(e) {
            e.preventDefault();
            this._initFacebookSDK();
            this.resources.W.Commands.executeCommand('WEditorCommands.Save');
            this._reportEvent('USER_PANEL_SAVE_SITE');
        },

        _onSaveComplete: function() {
            this.fireEvent('dataChanged');
        },

        _onPublishComplete: function() {
            this.fireEvent('dataChanged', {isPublished:true});
        },

        _toggleUserPanel: function(isVisible) {
            this.setState(isVisible ? 'visible' : 'hidden');
        },

        _getUserDetails: function(userData) {
            return {
                name: userData.userName,
                email: this._truncateUrl(userData.email, 20),
                originalEmail: userData.email,
                image: userData.profileImage,
                url: this._getSiteAddress()
            };
        },

        _getSiteState: function() {
            var state;

            if (this._isPublished()) {
                state = this._siteStates.PUBLISHED.stateName;
            } else if (this._isDraft()) {
                state = this._siteStates.DRAFT.stateName;
            } else if (!this._isDraft())  {
                state = this._siteStates.SAVED.stateName;
            }

            return state;
        },

        _getSiteStateLocale: function() {
            return this._siteStates[this._getSiteState().toUpperCase()].locale;
        },

        _getSiteAddress: function() {
            return window.top.editorModel.publicUrl;
        },

        _isDraft: function() {
            return this.resources.W.Config.getEditorModelProperty('firstSave');
        },

        _isPublished: function() {
            return editorModel.siteHeader.published;
        },

        _onPostInFacebookClick: function (event) {
            if (!window.FB) {
                this._initFacebookSDK(this._onPostInFacebookClick);
                return;
            }

            var text = !this._isDraft() ? this._translate('PUBLISH_WEB_SHARE_FB_MSG_FIRSTTIME') : this._translate('PUBLISH_WEB_SHARE_FB_MSG_NOT_FIRSTTIME');
            this.resources.W.Commands.executeCommand('WEditorCommands.PostInFacebook', { url: this._getSiteAddress(), text: text });
            this._reportEvent('USER_PANEL_PROMOTE_FACEBOOK', {c1:'Facebook'});
        },

        _onTweetInTwitterClick: function (event) {
            this.resources.W.Commands.executeCommand('WEditorCommands.ShareInTwitter', { siteUrl: this._websiteUrl, isPremium: this._isPremiumUser });
            this._reportEvent('USER_PANEL_PROMOTE_FACEBOOK', {c1:'Twitter'});
        },

        _translate: function(key) {
            return this.resources.W.Resources.get('EDITOR_LANGUAGE', key);
        },

        _translateUrl: function(key) {
            var hostName = window.location.host.replace('editor.','http://www.');
            return hostName + this._translate(key);
        },

        _collapse: function() {
            this.setState('hidden', 'visibility');
        },

        _initFacebookSDK: function(callback) {
            var appId = window.location.host.indexOf("wix.com") !== -1 ? '304553036307597' : '394905507233800',
                initData = {appId: appId, status: true, cookie: true, xfbml: 1, version: 'v2.0'};

            if (!define.getDefinition('resource', 'FacebookApi')) {
                define.resource('FacebookApi').withUrls('//connect.facebook.net/en_US/sdk.js');
            }

            window.resource.getResourceValue('FacebookApi', function() {
                window.FB.init(initData);
                if (callback) {
                    callback();
                }
            });
        }
    });
});
