define.experiment.component('wysiwyg.editor.components.panels.UserPanel.NGCore', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    var strategy = experimentStrategy;

    def.binds(strategy.merge(['_handleLoadedAppData', '_initAngularModule']));

    def.methods({
        initialize: strategy.after(function (compId, viewNode, args) {
            if (this._isIE() || this._isFB()) {
                return;
            }
            W.AngularManager.execute(this._initAngularModule);
        }),

        _onRender: function (renderEvent) {
            if (this._isIE() || this._isFB()) {
                return;
            }
        },

        _initAngularModule: function () {
            var app = window.angular.module('EditorUserPanel');

            app.value('LinksData', {
                myAccount: {
                    label: this._translate('USER_PANEL_MY_ACCOUNT'),
                    url: this._translateUrl('USER_PANEL_MY_ACCOUNT_LINK'),
                    openInNewTab: true,
                    biEvent: 'USER_PANEL_ACCOUNT_SETTINGS',
                    id: 'myAccountLink'
                },
                exitEditor: {
                    label: this._translate('USER_PANEL_EXIT_EDITOR'),
                    url: this._translateUrl('USER_PANEL_EXIT_EDITOR_LINK'),
                    openInNewTab: false,
                    biEvent: 'USER_PANEL_EXIT',
                    id: 'exitEditorLink'
                },
                manageMySite: {
                    label: this._translate('USER_PANEL_MANAGE_MY_SITE'),
                    url: this._translateUrl('USER_PANEL_MANAGE_MY_SITE_LINK') + '?view=site&metaSiteId=',
                    openInNewTab: true,
                    biEvent: 'USER_PANEL_MANAGE_SITE',
                    id: 'manageSiteLink'
                },
                restoreTemplate: {
                    label: this._translate('USER_PANEL_RESTORE_TO_TEMPLATE'),
                    url: '#',
                    biEvent: 'USER_PANEL_RESTORE_TO_TEMPLATE',
                    id: 'restoreTemplateLink'
                },
                social: {
                    label: this._translate('USER_PANEL_SHARE_TITLE'),
                    services: {
                        facebook: { label: this._translate('USER_PANEL_SOCIAL_SERVICE_FACEBOOK') },
                        twitter: { label: this._translate('USER_PANEL_SOCIAL_SERVICE_TWITTER') }
                    }
                }
            });

            var $this = this;
            app.controller('UserPanelCtrl', ['$scope', 'LinksData', 'UserPanelLanguage', function ($scope, LinksData, UserPanelLanguage) {
                $this.addEvent('dataChanged', function (params) {
                    LinksData.manageMySite.url = 'http://www.wix.com/my-account?view=site&metaSiteId=' + window.editorModel.metaSiteId;
                    $scope.render(params);
                });

                $this._scope = $scope;
                $scope.user = null;

                $scope.links = LinksData;
                $scope.langs = UserPanelLanguage;
                $scope.siteStatus = $this._translate($this._getSiteStateLocale());

                $scope.siteState = $this._getSiteState();
                $scope.isPublished = $scope.siteState === 'published';
                $scope.isSaved = $scope.siteState === 'saved';
                $scope.isDraft = $scope.siteState === 'draft';
                $scope.showTooltip = false;

                $scope.render = function (params) {
                    if (!params || !params.isPublished) {
                        $scope.siteState = $this._getSiteState();
                        $scope.siteStatus = $this._translate($this._getSiteStateLocale());
                        $scope.isPublished = $scope.siteState === 'published';
                        $scope.isSaved = $scope.siteState === 'saved';
                        $scope.isDraft = $scope.siteState === 'draft';
                    } else {
                        // override window.editorModel data after publish
                        $scope.siteState = 'published';
                        $scope.siteStatus = $this._translate('USER_PANEL_SITE_STATUS_PUBLISHED');
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

                // LOAD the App data!
                $this._loadAppData();
            }]);

            app.value('UserPanelLanguage', {
                PUBLISH_YOUR_SITE: $this._translate('USER_PANEL_PUBLISH_SITE'),
                SAVE_YOUR_SITE: $this._translate('USER_PANEL_SAVE_SITE'),
                MY_SITE: $this._translate('USER_PANEL_MY_SITE')
            });

            app.directive('bgImage', function () {
                return {
                    scope: {
                        bg: '='
                    },
                    link: function (scope, element, attrs) {
                        scope.$watch('bg', function (newVal, oldVal) {
                            if (newVal) {
                                scope.updateBg();
                            }
                        }, true);
                        scope.updateBg = function () {
                            element.css({
                                'background-image': 'url(' + scope.bg.img + ')',
                                'background-size': 'cover'
                            });
                        };
                    }
                };
            });

            app.directive('exorcism', ['$timeout', function (timer) {
                var linker = function (scope, element, attrs) {
                    var data = {
                        className: '.' + attrs['exorcism'],
                        el: element
                    };
                    var exorcise = function () {
                        element.css('display', 'block');
                    }.bind(data);
                    timer(exorcise, 0);
                };
                return {
                    link: linker
                };
            }]);
        },

        _loadAppData: function () {
            this._restClient = new this.imports.RESTClient();
            this._restClient.get('http://' + window.location.host + this._userDetailsUrl, {}, {
                "onSuccess": function (appData) {
                    this._restClient.get('http://' + window.location.host + this._userImageURL, {}, {
                        'onSuccess': function (imageData) {
                            _.assign(appData.payload, imageData);
                            this._handleLoadedAppData(appData);
                        }.bind(this)
                    });
                }.bind(this)
            });
            this.setState('hidden', 'visibility');
        },

        _handleLoadedAppData: function (appData) {
            if (this._scope) {
                this._updateAppData(appData);
            }
        },

        _updateAppData: function (appData) {
            var $this = this;
            this._scope.safeApply(function () {
                $this._scope.user = $this._getUserDetails(appData.payload);
                $this._scope.userAvatar = {'img': $this._scope.user.image};

                if ($this._scope.isDraft) {
                    $this._scope.user.url += $this._scope.langs.MY_SITE;
                    $this._scope.user.url = $this._scope.user.url.replace('http://', '');
                } else {
                    $this._scope.originalUrl = $this._scope.originalUrl || $this._scope.user.url;
                    $this._scope.user.url = $this._truncateUrl($this._scope.user.url, 28);
                }

                var LinksData = $this._scope.links;
                $this._scope.$siteStateMenuOptions = {
                    draft: {
                        siteUrl: $this._scope.user.siteUrl
                    },
                    saved: {
                        siteUrl: $this._scope.user.siteUrl,
                        manageMySite: LinksData.manageMySite
                    },
                    published: {
                        siteUrl: $this._scope.user.siteUrl,
                        manageMySite: LinksData.manageMySite
                    }
                };

                $this._scope.options = $this._scope.$siteStateMenuOptions[$this._scope.siteState];
            });
        }
    });
});
