/**
 * @class wysiwyg.viewer.components.SiteButton
 */
define.component('wysiwyg.viewer.components.SiteButton', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Utils', 'W.Config', 'W.Data']);

    def.utilize(['wysiwyg.common.utils.LinkRenderer','core.utils.css.Font']) ;

    def.propertiesSchemaType('ButtonProperties');

    def.skinParts( {
        label:{type:'htmlElement'},
        link:{type:'htmlElement'}
    });

    def.dataTypes(['LinkableButton']);

    def.binds(['_onClick', '_onOver', '_onOut', '_onMouseDown', '_onMouseUp']);

    def.states(['up', 'over', 'selected', 'pressed']);

    def.fields({
        _canFocus:true,
        _triggers:['click']
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:true
            },
            custom:[
                {
                    label:'LINK_LINK_TO',
                    command:'WEditorCommands.OpenLinkDialogCommand',
                    commandParameter:{
                        position:'center'
                    },
                    commandParameterDataRef:'SELF'
                }
            ],
            mobile: {
                isTextScalable: true,
                previewTextDataField: 'label'
            }
        }
    });

    def.methods({

        initialize:function (compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
            // stores the width of the button when it is changed via the editing frame.
            this._userSelectedWidth = 0;
            this._resizeTriggeredByData = false;
            this._rotatable = true;

            this._linkRenderer = new this.imports.LinkRenderer();
        },

        _onClick:function(e){
            LOG.reportEvent(wixEvents.VIEWER_BUTTON_COMPONENT_CLICK, {c1: this._compId, i1: this.isEnabled() ? 1 : 0});

            if(this.isEnabled()) {
                e.target = this.getViewNode();
                this.fireEvent(Constants.CoreEvents.CLICK, e);

                if(this._toggleMode) {
                    var state = (this.getState() != 'selected') ? 'selected' : 'over';
                    this.setState(state);
                }
            }else{
                return this._cancelEvent(e);
            }
        },

        _onOver:function (e) {
            if (this.isEnabled() && this.getState() != 'selected') {
                this.fireEvent('over', e);
                this.setState('over');
            }
        },

        _onOut:function (e) {
            if (this.isEnabled() && this.getState() != 'selected') {
                this.fireEvent('up', e);
                this.setState('up');
            }
        },

        _onMouseDown:function (e) {
            if (this.isEnabled() && this.getState() != 'selected') {
                this.setState("pressed");
                this.fireEvent(Constants.CoreEvents.MOUSE_DOWN, e);
            } else if (!this.isEnabled()) {
                return this._cancelEvent(e);
            }
        },

        _cancelEvent: function(evt){
            evt.stopPropagation();
            evt.preventDefault();
            return false;
        },

        _onMouseUp:function () {
            this.removeState("pressed");
        },

        _onEnabled:function () {
            var view = this._skinParts.view;
            view.addEvent(Constants.CoreEvents.CLICK, this._onClick);
            view.addEvent(Constants.CoreEvents.MOUSE_OVER, this._onOver);
            view.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onOut);
            view.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            view.addEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
        },

        _onDisabled: function(){
            var view = this._skinParts.view;
            view.removeEvent(Constants.CoreEvents.MOUSE_OVER,   this._onOver);
            view.removeEvent(Constants.CoreEvents.MOUSE_OUT,    this._onOut);
            view.removeEvent(Constants.CoreEvents.MOUSE_UP,     this._onMouseUp);
        },

        render: function () {
            if (this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this._normalizeForMobile();
            }
            var label = this._data.get('label');

            this._skinParts.label.set('text', label);
            if (!this._userSelectedWidth && !label) {
                this._userSelectedWidth = parseInt(this._view.getStyle('width'), 10);
            }

            // The order of functions in the below block is crucial.
            this._updateMinimumWidth();
            this._updateWidthFromText();
            this._updateMinimumHeight();
            this._setLineHeight();
            this._setTextAlignment();
            this._wCheckForSizeChangeAndFireAutoSized(0);

            this._renderLink() ;
        },

        _normalizeForMobile: function () {
            var processedPart = this._skinParts.label;
            var fontSize = this._getButtonFontSize();
            var wantedSize = this._convertSizeToMobile(fontSize);

            if (wantedSize != -1) {
                processedPart.setStyle('font-size', wantedSize);
            }
        },

        _getButtonFontSize:function(){
            var style = this.getStyle();
            if(style){
                var type = style.getPropertySource('fnt');
                var font = style.getProperty('fnt');
                var fontObj = (type == "value") ?  new this.imports.Font(font) : W.Theme.getProperty(font);
                return parseInt(fontObj.getSize());
            } else{
                var processedPart = this._skinParts.label;
                return parseInt(processedPart.getStyle('font-size'));
            }
        },

        _convertSizeToMobile: function (fontSize) {
            var scale = this.getScale();
            return W.Utils.mobile.convertFontSizeToMobile(fontSize, scale);
        },

        setScale: function(value) {
            this._$scale = parseFloat(value);
            this.render();
            this.fireEvent('autoSized');
        },

        _skinParamsChange:function () {
            this.resources.W.Utils.callLater(function () {
                this._renderIfReady();
            }.bind(this), [], this, 0);

            this.parent();
        },

        setHeight:function (value, force, trigger) {
            // the order here is important - lineHeight relies on basecomponent.setHeight to auto-correct the height according to minimum height.
            this.parent(value, force, trigger);
            this._setLineHeight();
        },

        _setLineHeight:function () {
            if (this.isReady()) {
                var viewNodePaddingTop = parseInt(this._view.getStyle('padding-top'));
                var viewNodePaddingBottom = parseInt(this._view.getStyle('padding-bottom'));
                var newLineHeight = this.getHeight() - viewNodePaddingTop - viewNodePaddingBottom;
                this._skinParts.label.setStyle('line-height', newLineHeight + "px");
            }
        },

        _setTextAlignment:function () {
            var align = this.getComponentProperty('align');
            this._skinParts.link.setStyle('text-align', align);
            this._setTextMargin();
        },


        _setTextMargin:function () {
            var margin = this.getComponentProperty('margin');
            var align = this.getComponentProperty('align');
            var labelWidth = parseInt(this._skinParts.label.offsetWidth);
            var myWidth = this.getWidth();
            // Prevent margin from pushing the text outside the dimensions of the button
            if (labelWidth + margin > myWidth) {
                margin = myWidth - labelWidth;
            }
            if (align == 'left') {
                this._skinParts.label.setStyle('margin-right', '');
                this._skinParts.label.setStyle('margin-left', margin + 'px');
            }
            else if (align == 'right') {
                this._skinParts.label.setStyle('margin-left', '');
                this._skinParts.label.setStyle('margin-right', margin + 'px');
            }
            else {
                this._skinParts.label.setStyle('margin-left', '');
                this._skinParts.label.setStyle('margin-right', '');
            }
        },

        _setMinimumWidthAccordingToText:function () {
            var labelWidth = parseInt(this._skinParts.label.offsetWidth);
            var viewNodePaddingLeft = parseInt(this._view.getStyle('padding-left'));
            var viewNodePaddingRight = parseInt(this._view.getStyle('padding-right'));
            this.setMinW(labelWidth + viewNodePaddingLeft + viewNodePaddingRight);
        },

        _setMinimumHeightAccordingToText:function () {
            var viewNodePaddingTop = parseInt(this._view.getStyle('padding-top'));
            var viewNodePaddingBottom = parseInt(this._view.getStyle('padding-bottom'));
            this._skinParts.label.setStyle('line-height', "");
            this.setMinH(this._skinParts.label.offsetHeight + viewNodePaddingTop + viewNodePaddingBottom);
        },

        _updateMinimumHeight:function () {
            this._setMinimumHeightAccordingToText();
            this.setHeight(this.getHeight(), false, false);
        },

        _updateMinimumWidth:function () {
            this._setMinimumWidthAccordingToText();
            this.setWidth(this.getWidth(), false, false);
        },

        _updateWidthFromText:function () {
            // if user didn't select a width yet, use the current width.
            this._userSelectedWidth = this._userSelectedWidth == 0 ? this.getWidth() : this._userSelectedWidth;
            var newWidth = Math.max(this.getSizeLimits().minW, this._userSelectedWidth);
            this.setWidth(newWidth, false, false);
        },

        _onResize:function () {
            this.parent();
            if (this._resizeTriggeredByData == false) {
                // If resize happened via user input (here we assume everything that's not triggered by data change is triggered by user)
                // then store the width, and use it as the width reference when the text is changed.
                this._userSelectedWidth = parseInt(this._view.getStyle('width'));
            } else {
                this._resizeTriggeredByData = false;
            }
            if (!this.isReady()) {
                return 0;
            }
            this._setTextMargin();
        },

        _onDataChange:function (dataItem, field, value) {
            this._resizeTriggeredByData = true;
            this.parent(dataItem, field, value);

            if(this._isRendered) {
                this._renderLink() ;
            }
        },

        _renderLink: function() {
            var dataItemWithSchema = this.getDataItem();
            var linkId = dataItemWithSchema._data.link ;
            if(!linkId) {
                this._linkRenderer.removeRenderedLinkFrom(this._skinParts.link, this) ;
                return ;
            }
            var linkDataItem = this.resources.W.Data.getDataByQuery(linkId) ;
            if(linkDataItem) {
                this._linkRenderer.renderLink(this._skinParts.link, linkDataItem, this) ;
            }
        }

    });
});