define.component('wysiwyg.common.components.youtubesubscribebutton.editor.YouTubeSubscribeButtonPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['YouTubeSubscribeButton']);

    def.resources(['W.Resources','W.Utils']);

    def.binds(['_urlChannelToData', '_dataToUrlChannel', '_channelUrlValidationMessage', '_dataChangeHandler', '_onDisposed']);

    def.statics({
        YOUTUBE_PREFIX: "https://www.youtube.com/"
    }) ;

    def.skinParts({
        uriLabel:{
            type: Constants.PanelFields.Label.compType,
            argObject: { labelText: 'YouTubeSubscribeButton_INSERT',
                toolTip: Constants.PanelFields.ComboBox.args.toolTip('YouTubeSubscribeButton_InsertUrl_ttid')}
        },
        uriInput:{
            type: Constants.PanelFields.SubmitInput.compType,
            argObject: {
                placeholderText: 'Channel URL',
                buttonLabel: 'YouTubeSubscribeButton_UPDATE',
                maxLength: '1024'
            },
            bindHooks: ['_urlChannelToData', '_dataToUrlChannel'],
            bindToData: 'youtubeChannelId',
            hookMethod: '_addValidator'
        },
        layoutCB: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'YouTubeSubscribeButton_LAYOUT' },
            bindToProperty: 'layout',
            dataProvider:  function(){
                var properties = this._previewComponent.getComponentProperties();
                var labels = {
                    default: this._translate('YouTubeSubscribeButton_DEFAULT', 'Default'),
                    full: this._translate('YouTubeSubscribeButton_EXTENDED', 'Extended')
                };

                var layouts = properties._schema.layout.enum.map(function (prop) {
                    return { label: labels[prop], value: prop };
                });
                return layouts;
            }
        },
        themeCB: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'YouTubeSubscribeButton_COLOR',
                         toolTip: Constants.PanelFields.ComboBox.args.toolTip('YouTubeSubscribeButton_ThemeComboBox_ttid')
                       },
            bindToProperty: 'theme',
            dataProvider:  function(){
                var properties = this._previewComponent.getComponentProperties();
                var labels = {
                    light: this._translate('YouTubeSubscribeButton_DARK', 'Dark'),
                    dark: this._translate('YouTubeSubscribeButton_LIGHT', 'Light')
                };
                //this is not a mistake! dark/light is the opposite in google's api
                // (they mean your bg color, and not their text)

                var themes = properties._schema.theme.enum.map(function (prop) {
                    return { label: labels[prop], value: prop };
                });
                return themes;
            }
        },
        addAnimation: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'FPP_ADD_ANIMATION_LABEL'}
        }
    });

    def.methods({
        render: function (){
            this.parent();
            var properties = this._previewComponent.getComponentProperties();
            properties.addEvent(Constants.DataEvents.DATA_CHANGED, this._dataChangeHandler);

            this.addEvent(Constants.ComponentEvents.DISPOSED, this._onDisposed);

            this._dataChangeHandler(properties, "layout", properties.getData(),"render");
        },

        _onDisposed: function(){
            if (this._previewComponent && this._previewComponent.getComponentProperties()){
                this._previewComponent.getComponentProperties().removeEvent(Constants.DataEvents.DATA_CHANGED, this._dataChangeHandler);
            }
        },

        _urlChannelToData: function(url) {
            var videoId = url.split('?')[0];
            var urlParts = videoId.split('/');
            videoId = urlParts[urlParts.length - 1];
            return videoId;
        },

        _dataToUrlChannel: function(data) {
            if (!data) {
                return "";
            } else {
                return this.YOUTUBE_PREFIX + data;
            }
        },

        _addValidator: function (definition){
            definition.argObject.validatorArgs = {validators: [this._channelUrlValidationMessage]};
            return definition;
        },

        _dataChangeHandler: function (dataItem, field, value,source){
            if (this._skinParts){
                if (field === "layout"){
                    var comp = this._previewComponent;
                    if (value.layout === "full"){
                        this._skinParts.themeCB.enable();
                        if (source !="render"){

                            comp.setMinW(comp._fullLayoutWidth);
                            comp.setMinH(comp._fullLayoutHeight);
                            comp.setWidth(comp._fullLayoutWidth+"px");
                            comp.setHeight(comp._fullLayoutHeight+"px");
                        }
                    } else if (value.layout === "default"){
                        if (this._previewComponent.getComponentProperties()){
                            this._previewComponent.getComponentProperties().set('theme', 'light');
                        }
                        if (source !="render"){
                            comp.setMinW(comp._defaultLayoutWidth);
                            comp.setMinH(comp._defaultLayoutHeight);
                            comp.setWidth(comp._defaultLayoutWidth+"px");
                            comp.setHeight(comp._defaultLayoutHeight+"px");
                        }
                        this._skinParts.themeCB.disable();
                    }
                }
            }
        },

        _channelUrlValidationMessage: function (value) {
            var isUrl = this.resources.W.Utils.isValidUrl(value);
            var isYoutubePrefix = false;

            // Test for long youtube channel url prefix: http://youtube.com/
            var YTLongUrl = /(?:youtube\.com\/)/g;
            // Test for short youtube channel url prefix: http://youtu.be/
            var YTShortUrl = /(?:youtu\.be\/)/g;

            var match = YTLongUrl.exec(value) || YTShortUrl.exec(value);
            if (match) {
                isYoutubePrefix = true;
            }

            if (isUrl && isYoutubePrefix) {
                return false;
            } else {
                return this._translate('YouTubeSubscribeButton_URI_ERROR');
            }
        },

        _translate: function (key, fallback) {
            return this.resources.W.Resources.get('EDITOR_LANGUAGE', key, fallback);
        }
    });
});
