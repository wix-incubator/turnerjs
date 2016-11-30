define.component('wysiwyg.viewer.components.AdminLogin', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.viewer.components.PasswordLogin");

    def.binds([ 'centerDialog', '_onSubmit', '_reportError', '_invalidateErrorState', '_onKeyPress']);

    def.skinParts({
        'blockingLayer': {'type': 'htmlElement'},
        'passwordInput': {type: 'wysiwyg.viewer.components.inputs.TextInput', hookMethod: "_bindPasswordField"},
        'submitButton': {'type': 'htmlElement'},
        'xButton': {'type': 'htmlElement', 'command': 'WViewerCommands.PasswordLogin.Close'},
        'favIcon': {'type': 'htmlElement'},
        'header': {'type': 'htmlElement'},
        'dialog': {'type': 'htmlElement'}
    });

    def.dataTypes(["Text"]);

    def.states({
        DEFAULT:["normal", "confirm"],
        'displayDevice':[ 'mobile', 'desktop' ]
    });

    def.methods({
        //Experiment PageSecurity.New was promoted to feature on Thu Oct 18 11:20:20 IST 2012
        initialize: function (compId, viewNode, args) {
            this.isVolatile = true;
            if (!window.userApi && window.UserApi) { // if user api 2 js is loaded, but not initialized
                this._userApi = window.UserApi.getInstance().init({
                    "orgDocID": "",
                    "usersDomain": window.usersDomain || 'https://users.wix.com/wix-users";',
                    "corsEnabled": true,
                    "dontHandShake": true,
                    "urlThatUserRedirectedFrom": ""
                });
            }
            else {
                this._userApi = window.userApi;
            }

            this.parent(compId, viewNode, args);


            this.VIEWER_STRINGS['LOGIN_HEADER'] = "Login to edit your site";

            this.ERR_MAP = {
                "9975": this.VIEWER_STRINGS["LOGIN_ERR_GENERAL"],
                "9972": this.VIEWER_STRINGS["LOGIN_ERR_WRONG_PASSWORD"]
            };
        },

        //Experiment PageSecurity.New was promoted to feature on Thu Oct 18 11:20:20 IST 2012
        _validatePassword: function (password, onSuccess, onError) {
            var errMessage = this._validateInput(password);
            if (!errMessage) {
                var rendererModel = window.rendererModel;
                var metaSiteId = rendererModel.metaSiteId;
                var siteId = rendererModel.siteId;
                var guid = window.siteHeader.userId;
                var serverName = this.injects().Config.getServiceTopologyProperty('serverName');
                var rememberMe = false;
                var editorSessionId = this.resources.W.Utils.getGUID();
                var editorURL = this.injects().Config.getServiceTopologyProperty('htmlEditorUrl') + '/editor/web/renderer/edit/' + siteId + '?metaSiteId=' + metaSiteId + '&editorSessionId=' + editorSessionId;

                if (!this._userApi) {
                    this._reportError(this.VIEWER_STRINGS["LOGIN_ERR_GENERAL"]);
                    return;
                }

                this._userApi.loginByGuid(guid, password, rememberMe, function (e) {
                    onError(this.VIEWER_STRINGS["LOGIN_ERR_GENERAL"]);
                }.bind(this), function (data) {
                    // On success
                    var success = data.success;
                    if (success) {
                        onSuccess();
                        if (this.injects().Config.env.$isPublicViewerFrame || this._debugMode) {
                            window.open(editorURL, "_blank");
                        }
                    }
                    else {
                        var errMessage = this.ERR_MAP[ data.errorCode ] || this.ERR_MAP[9975]; // "Communication error"
                        onError(errMessage);
                    }
                }.bind(this));
            }
            else {
                onError(errMessage);
            }
        },

        _onSubmit: function () {
            if (!this.injects().Config.env.$isPublicViewerFrame) {
                this.injects().Commands.executeCommand('adminLogin.submitAttempt', { component: this._skinParts.submitButton }, this);
            }
            else {
                this.parent();
            }
        },


        _validateInput: function (password) {
            var passLength = password.length;
            if (passLength < 4 || passLength > 15) {
                return this.ERR_MAP[ "9972" ];
            }
            else if (password.test(/^[a-zA-Z0-9_\-!@#$%^&*]+$/) == false) {
                return this.ERR_MAP[ "9972" ];
            }
            return null;
        }
    });

});



