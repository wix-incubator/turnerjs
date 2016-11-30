define.component('wysiwyg.common.components.spotifyplayer.editor.SpotifyPlayerPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.resources(['W.Commands', 'W.EditorDialogs', 'W.Config', 'W.Editor', 'topology', 'W.UndoRedoManager']);

    def.binds(['_spotifyUriValidator', '_applyVisibilityConditions', '_toggleUriInput',
               '_getSearchDialogUrl', '_onMessageFromDialog', '_onUriChange']);

    def.dataTypes(['SpotifyPlayer']);

    def.propertiesSchemaType('SpotifyPlayerProperties');

    def.skinParts({
        searchLabel:{
            type: Constants.PanelFields.Label.compType,
            argObject: { labelText: W.Resources.get('EDITOR_LANGUAGE', 'SpotifyPlayer_SEARCH_LABEL') },
            visibilityCondition: function(){ return this._showSearchButton; }
        },
        searchBtn: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {
                buttonLabel: 'SpotifyPlayer_SEARCH_BUTTON_LABEL',
                command: 'WEditorCommands.ShowSpotifySearchDialog'
            },
            hookMethod: '_getSearchDialogUrl',
            visibilityCondition: function(){ return this._showSearchButton; }
        },
        enterUriLink: {
            type: Constants.PanelFields.InlineTextLinkField.compType,
            argObject: {
                buttonLabel: 'SpotifyPlayer_ENTER_URI'
            },
            visibilityCondition: function(){ return this._showSearchButton; }
        },
        inputLabel:{
            type: Constants.PanelFields.Label.compType,
            argObject: { labelText: 'SpotifyPlayer_INSERT_URI' }
        },
        uriInput:{
            type: Constants.PanelFields.SubmitInput.compType,
            argObject: {
                placeholderText: 'spotify:track:5JunxkcjfCYcY7xJ29tLai',
                buttonLabel: 'SpotifyPlayer_UPDATE',
                maxLength: '1024'
            },
            bindToData: 'uri',
            hookMethod: '_addUriValidator'
        },
        sizeCB: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'SpotifyPlayer_SIZE' },
            bindToProperty: 'size',
            dataProvider:  function(){
                return [
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SpotifyPlayer_SIZE_COMPACT'), value: 'compact' },
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SpotifyPlayer_SIZE_LARGE'), value: 'large' }
                ];
            }
        },
        colorCB: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'SpotifyPlayer_COLOR' },
            bindToProperty: 'color',
            dataProvider:  function(){
                return [
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SpotifyPlayer_COLOR_DARK'), value: 'black' },
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SpotifyPlayer_COLOR_LIGHT'), value: 'white' }
                ];
            }
        },
        styleCB: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'SpotifyPlayer_STYLE' },
            bindToProperty: 'style',
            dataProvider:  function(){
                return [
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SpotifyPlayer_STYLE_LIST'), value: 'list' },
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SpotifyPlayer_STYLE_COVERART'), value: 'coverart' }
                ];
            }
        },
        addAnimation: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'FPP_ADD_ANIMATION_LABEL'}
        }
    });

    def.methods({
        initialize: function(compId, viewNode, extraArgs) {
            this.parent(compId, viewNode, extraArgs);

            //The search in Spotify requires CORS. If the browser doesn't support it - NO SEARCH FOR YOU! COME BACK 1 YEAR!
            this._showSearchButton = Modernizr.cors;
            if(!this._showSearchButton) {
                return;  //All the code below is for the search dialog
            }

            //Listen to messages from search dialog iframe (sends the selected URI)
            window.addEventListener('message', this._onMessageFromDialog, false);

            //Listen to component deletion event to remove the post message event listener
            var panel = this;
            var component = this.resources.W.Editor.getSelectedComp();
            component.registerOnCompDelete(function(){
                window.removeEventListener('message', panel._onMessageFromDialog, false);
            });
        },

        _onAllSkinPartsReady: function(){
            this.parent();
            if(this._showSearchButton) {
                this._skinParts.enterUriLink.getViewNode().addEvent('click', this._toggleUriInput);
                this._toggleUriInput(true);
            }
            else {
                this._toggleUriInput(false);
            }

            this._setHoverEvent();

            var properties = this._previewComponent.getComponentProperties();
            var data = this._previewComponent.getDataItem();
            data.addEvent(Constants.DataEvents.DATA_CHANGED, this._onUriChange);
            properties.addEvent(Constants.DataEvents.DATA_CHANGED, this._applyVisibilityConditions);
            this._applyVisibilityConditions(null, 'size', {size: properties.get('size')});
        },

        _setHoverEvent: function (){
            var hoverImg = this._skinParts.inputLabel.getViewNode().getChildren('[skinPart="img"]');
            var hoverLabel = this._skinParts.inputLabel.getViewNode();
            hoverLabel.addEvents({
                mouseover: function(e){
                    if(e.event.target.nodeName == 'STRONG') {
                        hoverImg.addClass('show');
                    }
                },
                mouseout: function(e){
                    if(e.event.target.nodeName == 'STRONG') {
                        hoverImg.removeClass('show');
                    }
                }
            });
        },

        _toggleUriInput: function (_shouldCollapse){
            var shouldCollapse = (typeof _shouldCollapse === 'boolean') ? _shouldCollapse : !this._skinParts.inputLabel.getViewNode().hasClass('hidden');
            this._skinParts.inputLabel.setCollapsed(shouldCollapse);
            this._skinParts.uriInput.setCollapsed(shouldCollapse);
        },

        _applyVisibilityConditions: function (dataItem, field, value){
            if(field !== 'size') {
                return;
            }

            var isCollapsed = (value.size === 'compact');

            if(this._skinParts && this._skinParts.colorCB && this._skinParts.styleCB) {
                this._skinParts.colorCB.setCollapsed(isCollapsed);
                this._skinParts.styleCB.setCollapsed(isCollapsed);
            }
        },

        _onUriChange: function (dataItem, field, newValue, oldValue){
            if(field == 'uri' && newValue.uri && !oldValue.uri) {
                var letComponentUpdateResizableSidesDelay = 100;
                this.callLater(function (){
                    this.resources.W.Commands.executeCommand(Constants.EditorUI.RESIZE_HANDLES_CHANGED);
                }.bind(this), [], letComponentUpdateResizableSidesDelay);
            }
        },

        _addUriValidator: function (definition){
            definition.argObject.validatorArgs = {validators: [this._spotifyUriValidator]};
            return definition;
        },

        _spotifyUriValidator: function(uri) {
            if(!uri || !uri.indexOf || uri.indexOf('spotify:') != 0) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'SpotifyPlayer_URI_ERROR', 'SpotifyPlayer_URI_ERROR');
            }
        },

        _getSearchDialogUrl: function (definition){
            var iframeBaseUrl = this.resources.topology.wysiwyg + '/html/external/SpotifySearch/index.html?';
            var fontFaceUrl = this.resources.W.Config.getServiceTopologyProperty('publicStaticsUrl') + "css/Helvetica/fontFace.css";
            var params = [
                'id=' + this.getID(),
                'lang=' + this.resources.W.Config.getLanguage(),
                'tabs=' + JSON.stringify(['tracks', 'albums', 'artists']),
                'default_tab=tracks',
                'fontFaceUrl=' + encodeURIComponent(fontFaceUrl)
            ];

            definition.argObject.commandParameter = {
                'iframeUrl': iframeBaseUrl + params.join('&'),
                'title': 'SpotifyPlayer_DIALOG_TITLE'
            };

            return definition;
        },

        _onMessageFromDialog: function (e){
            var msgData;

            try {
                msgData = JSON.parse(e.data);
            } catch(e) {
                return;
            }

            if (!msgData || msgData.id !== this.getComponentUniqueId()) {
                return;
            }

            if(msgData.uri) {
                var data = this.getDataItem();
                this.resources.W.UndoRedoManager.startTransaction();
                data.set('uri', msgData.uri);
            }

            if(msgData.closeSearchDialog) {
                this.resources.W.EditorDialogs.SpotifySearchDialog.getLogic().closeDialog();
            }
        }
    });
});
