/**
 * @Class wysiwyg.editor.components.panels.HtmlComponentPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.HtmlComponentPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_preview', '_onComboChange', '_hideInvalidUrlMessage', '_fromUrlToHtml', '_fromHtmlToTempUrl']);

    def.dataTypes(['HtmlComponent']);

    def.resources(['W.Config', 'W.Utils']);

    /**
     * @lends wysiwyg.editor.components.panels.HtmlComponentPanel
     */
    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._src = null;
            this._html = null;
            this._stateCombo = null;
            this._saveButton = null;
            this._loadingLabel = null;
            this._errorLabel = null;
        },

        _createFields:function () {
            var options = [
                {value:'external', label:this._translate('HtmlComponentPanel.stateCombo.external')},
                {value:'embedded', label:this._translate('HtmlComponentPanel.stateCombo.embedded')}
            ];

            this._stateCombo = this.addComboBoxField(this._translate('HtmlComponentPanel.HtmlMode'), options);
            this._stateCombo.addEvent('inputChanged', this._onComboChange);

            this._src = this.addInputField(this._translate('HtmlComponentPanel.HtmlSource'),
                this._translate('HtmlComponentPanel.HtmlSourceSample'), 0, 400);
            this._html = this.addTextAreaField(this._translate('HtmlComponentPanel.HtmlCode'), '250px', null, 8192);

            this._srcMessage = this.addSubLabel(this._translate('HtmlComponentPanel.InvalidUrl'), '#600');
            this._src.addEvent(Constants.CoreEvents.KEY_UP, function (e) {
                this._hideInvalidUrlMessage();
                if (e.code == 13) {
                    this._preview();
                }
            }.bind(this));
            this._hideInvalidUrlMessage();

            var panel = this;
            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);
                panel._saveButton = this.addButtonField('', this._translate('HtmlComponentPanel.UpdateButton'), false, null, 'smaller');
                panel._saveButton.addEvent('click', panel._preview);
                panel._setCorrectVisibility(panel._data.get('sourceType') == 'external');
            }, 'skinless', null, null, null, 'right');

            this._loadingLabel = this.addLabel(this._translate('HtmlComponentPanel.Loading'));
            this._loadingLabel.collapse();

            this._errorLabel = this.addSubLabel('', '#600');
            this._errorLabel.collapse();

            // THIS SECTION IS A HACK AND SHOULD NOT BE COPIED!!!!!
            var getValue = function () {
                var targetLogic = this._getTargetLogic();
                return targetLogic && targetLogic.getValue && targetLogic.getValue();
            };
            this._src.getValue = getValue;
            this._html.getValue = getValue;
            this._stateCombo.getValue = getValue;
            // END OF HACK SECTION

            this.addBreakLine(8);
            this.addInputGroupField(function(panel) {
                this.addLabel(this._translate('HTML_COMP_FREEZE_FRAME_TITLE'));
                this.addCheckBoxField(this._translate('HTML_COMP_FREEZE_FRAME_CHECKBOX'), "Reset_when_leaving_page_ttid").bindToField("freezeFrame").addEvent('inputChanged', panel._onFreezeFrameToggle);
            });

            this.addAnimationButton();
        },

        _onFreezeFrameToggle: function(e) {
            this.getDataItem().set('freezeFrame', e.value);
        },

        _isValidUrl:function (text) {
            return this.resources.W.Utils.isValidUrl(text);
        },

        _hideInvalidUrlMessage:function () {
            this._srcMessage.collapse();
        },

        _showErrorMessage:function (key) {
            this._errorLabel.setValue(this._translate(key));
            if (!this._shouldHideField(this._errorLabel)) {
                this._errorLabel.uncollapse();
            }
        },

        _shouldHideField: function(inputFieldProxy) {
            return this.parent(inputFieldProxy) && this._isMobileMode();
        },

        _isMobileMode: function() {
            return this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
        },

        _hideErrorMessage:function () {
            this._errorLabel.collapse();
        },

//        render:function () {
//            this.parent();
//
//            var sourceType = this._data.get('sourceType');
//            var url = this._data.get('url');
//
//            if (sourceType == 'external') {
//                this._stateCombo.setValue('external');
//                this._src.setValue(url);
//            }
//            else { // htmlEmbedded and tempUrl
//                this._stateCombo.setValue('embedded');
//
//                if (url) {
//                    // the content is a url, bring it from the server
//                    this._showLoading(true);
//                    this._fromUrlToHtml(url, function (response) {
//                        this._showLoading(false);
//                        if (response.success) {
//                            this._html.setValue(response.html);
//                        }
//                        else {
//                            this._showErrorMessage('HtmlComponentPanel.Errors.HtmlCannotBeRetrieved');
//                        }
//                    }.bind(this));
//                }
//            }
//            this._setCorrectVisibility(sourceType == 'external');
//        },

        render:function () {
            this.parent();

            var sourceType = this._data.get('sourceType');
            var url = this._data.get('url');

            if (sourceType == 'external') {
                this._stateCombo.setValue('external');
                this._src.setValue(url);
            }
            else { // htmlEmbedded and tempUrl
                this._stateCombo.setValue('embedded');

                if (url) {
                    // the content is a url, bring it from the server
                    this._showLoading(true);

                    if (this.getDataItem().get('sourceType') === "htmlEmbedded") {
                        url = this._validateAndFixUrl(url);
                    }

                    this._fromUrlToHtml(url, function (response) {
                        this._showLoading(false);
                        if (response.success) {
                            this._html.setValue(response.html);
                        }
                        else {
                            this._showErrorMessage('HtmlComponentPanel.Errors.HtmlCannotBeRetrieved');
                        }
                    }.bind(this));
                }
            }
            this._setCorrectVisibility(sourceType == 'external');
        },

        _validateAndFixUrl: function(url) {
            var protocolRegex = /^(ftps|ftp|http|https).*$/;

            if (protocolRegex.test(url)) {
                return url;
            }

            if (url.indexOf('static.wixstatic.com') >= 0) {
                return "http://" + url;
            }

            if (url.indexOf("html/") === 0) {
                return this.resources.W.Config.getServiceTopologyProperty("staticServerUrl") + url;
            }

            return url;
        },

        _onComboChange:function (event) {
            if (event && event.value) {
                this._hideErrorMessage();
                this._setCorrectVisibility(event.value == 'external');
            }
        },

        _preview:function () {
            var sourceType = this._stateCombo.getValue();
            if (sourceType == 'external') {
                var src = this._src.getValue();
                if (!this._isValidUrl(src)) { // not valid URL, show message and cancel user request
                    this._srcMessage.uncollapse();
                    return;
                }
                this._hideInvalidUrlMessage();
//                this.injects().UndoRedoManager.startTransaction();
                this._data.set('sourceType', 'external', true);
                this._data.set('url', src); // only the last triggers the dataChange event
//                this.injects().UndoRedoManager.endTransaction();
            }
            else {
                var html = this._html.getValue();
                if (html.test(/^\s*$/)) { // if this is an empty HTML code, treat it as empty
//                    this.injects().UndoRedoManager.startTransaction();
                    this._data.set('sourceType', 'htmlEmbedded', true);
                    this._data.set('url', null); // only the last triggers the dataChange event
//                    this.injects().UndoRedoManager.endTransaction();
                    return;
                }
                this._showLoading(true);
                this._fromHtmlToTempUrl(html, function (response) {
                    this._showLoading(false);
                    if (response.success) {
//                        this.injects().UndoRedoManager.startTransaction();
                        this._data.set('sourceType', 'tempUrl', true);
                        this._data.set('url', response.url); // only the last triggers the dataChange event
//                        this.injects().UndoRedoManager.endTransaction();
                    }
                    else {
                        if (response.errorCode == -15) {
                            this._showErrorMessage('HtmlComponentPanel.Errors.NotLoggedIn');
                        }
                        else {
                            this._showErrorMessage('HtmlComponentPanel.Errors.UnableToStoreHtml');
                        }
                    }
                }.bind(this));
            }
        },

        _setCorrectVisibility:function (isExternal) {
            if (isExternal) {
                if (!this._shouldHideField(this._src)) {
                    this._src.uncollapse();
                }
                this._html.collapse();
            }
            else {
                this._hideInvalidUrlMessage();
                this._src.collapse();
                if (!this._shouldHideField(this._html)) {
                    this._html.uncollapse();
                    this._html.setFocus(); //IE10 hack - #WOH-7558
                }
            }
        },

        _showLoading:function (toShow) {
            if (this._saveButton) {
                if (toShow) {
                    this._hideErrorMessage();
                    this._saveButton.disable();
                    if (!this._shouldHideField(this._loadingLabel)) {
                        this._loadingLabel.uncollapse();
                    }
                }
                else {
                    this._saveButton.enable();
                    this._loadingLabel.collapse();
                }
            }
        },

        /**
         * Gets the URL of an html that is stored on the static servers and calls
         * the callback(html)
         */
        _fromUrlToHtml:function (url, callback) {
            this.injects().ServerFacade.getContentFromStaticUrl(url,
                function (response) {
                    callback({success:true, html:response});
                },
                function (errorDescription, errorCode) {
                    callback({success:false, errorCode:errorCode, errorDescription:errorDescription});
                });
        },

        /**
         * Gets the URL of an html that is stored on the static servers in a
         * temporary url and calls the callback(url)
         */
        _fromHtmlToTempUrl:function (html, callback) {
            this.injects().ServerFacade.saveHtmlAsTempStaticUrl(html,
                function (response) {
                    callback({success:true, url:response});
                },
                function (errorDescription, errorCode) {
                    callback({success:false, errorCode:errorCode, errorDescription:errorDescription});
                });
        }
    });
});