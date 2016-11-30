/**
 * @class wysiwyg.viewer.components.WRichText
 */
define.component('wysiwyg.viewer.components.WRichText', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.utilize([
        'wysiwyg.common.utils.LinkRenderer',
        'wysiwyg.viewer.components.classes.TextScalingModifier',
        'wysiwyg.viewer.components.classes.TextBrightnessModifier'
    ]);

    def.resources(['W.Data', 'W.Commands', 'W.Css', 'W.Config', 'W.Utils', 'W.Theme']);

    def.dataTypes(['RichText', 'Text', 'StyledText']);

    def.propertiesSchemaType('WRichTextProperties');

    def.skinParts({
        richTextContainer: {type: 'htmlElement', 'optional': true}
    });

    def.fields({
        _renderTriggers: [ Constants.DisplayEvents.ADDED_TO_DOM, Constants.DisplayEvents.DISPLAYED] // the base component has no render triggers, it just renders when it's ready
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            },
            custom: [
                {
                    label: 'EDIT_RICH_TEXT',
                    command: 'EditorUI.StartEditRichText',
                    commandParameter: {"source":"fpp"}
                }
            ],
            mobile: {
                isTextScalable: true,
                previewTextDataField: 'text',
                disablePropertySplit: true
            }
        }
    });

    /**
     * @lends wysiwyg.viewer.components.WRichText
     */
    def.methods({
        initialize: function (compId, viewNode, argsObject) {
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._setLinksDataToElements);
            this.parent(compId, viewNode, argsObject);
            this.setMaxH(5000);
            this._linkRenderer = new this.imports.LinkRenderer();
            this._isMobile = this._isMobileComponent();
            this._brightness = 1;
        },

        _isMobileComponent: function() {
            return this.getComponentUniqueId().contains(Constants.ViewerTypesParams.DOM_ID_PREFIX.MOBILE);
        },

        setIsPropertiesSavedInServer: function() {
            var isPersistent = this._properties.get('id').contains(Constants.ViewerTypesParams.DOM_ID_PREFIX.MOBILE);
            this._properties.setMeta('isPersistent', isPersistent);
        },

        //for some reason in old text we assumed that we have the data here
        //we'll do the same for now..
        _onAllSkinPartsReady: function () {
            this._prepareMobileModifiers();
            this._updateText();
            if (this.resources.W.Config.env.$isPublicViewerFrame) {
                //VIEW isn't one of the values of the WEditModeChanged command
                this._setLinksDataToElements("VIEW");
            }
        },

        _prepareMobileModifiers: function() {
            var parentNode = this.getRichTextContainer();
            if (this._isMobile) {
                this._scalingModifier = new this.imports.TextScalingModifier(this._$scale, parentNode);
                this._brightnessModifier = new this.imports.TextBrightnessModifier(this._brightness, parentNode);
            }
        },

        _onDataChange: function(dataItem, field, newValue, oldValue) {
            if (!this._skinParts) {
                return;
            }
            if (dataItem === this._data) {
                this._updateText();
            }
            else if (this._shouldApplyBrightness(dataItem, field)) {
                this.setBrightness(newValue[field]);
            }
            this.parent(dataItem, field, newValue, oldValue);
        },

        _shouldApplyBrightness: function(dataItem, field) {
            return this._isMobile && dataItem === this._properties && field === 'brightness';
        },

        _updateText: function () {
            this._loadFontsToViewer();
            var textContent = this.getDataItem().get('text');
            this.getRichTextContainer().set('html', textContent);
            //in public and preview - we need to update the links after updating the text content from the data.
            if (this._shouldUpdateLinksData()) {
                this._setLinksDataToElements("VIEW");
            }
            if (this._isMobile) {
                this._setMobileComponentAppearance();
            }
        },

        _setMobileComponentAppearance: function() {
            var currentBrightness = (this._properties && this._properties.get('brightness')) || this._brightness;
            this._brightnessModifier.emptyCache();
            this.setBrightness(currentBrightness);
            this._scalingModifier.updateDomAccordingToNewValue();
        },

        _shouldUpdateLinksData:function(){
            return W.Config.env.isInInteractiveViewer();
        },

        _setLinksDataToElements: function (mode) {
            if (!this._skinParts || (mode !== "PREVIEW" && mode !== "VIEW")) {
                return;
            }
            var links = $(this.getRichTextContainer()).getElements('a');
            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                var dataQuery = link.getAttribute("dataquery");
                if (dataQuery) {
                    this._setLinkAttributes(dataQuery, link);
                } else if(this.resources.W.Config.env.$isEditorViewerFrame && (!link.getAttribute('target') || link.getAttribute('target') != '_blank')){
                    link.setAttribute('target', '_blank');
                }
            }
        },

        _setLinkAttributes: function (dataQuery, linkElm) {
            var linkDataItem = this.resources.W.Data.getDataByQuery(dataQuery) ;

            if(linkDataItem) {
                this._linkRenderer.renderLink(linkElm, linkDataItem, this) ;

                if(linkDataItem.getType() !== 'PageLink') {
                    this._sanitizeLink(linkElm);
                }
            }
        },

        getRichTextContainer: function () {
            if (!this._skinParts) {
                return null;
            }
            return this._skinParts.richTextContainer || this.getViewNode();
        },

        _loadFontsToViewer: function () {
            var usedFontNames = this._getUsedFontsInComp();
            //shouldn't be a problem since css manager aggregates the font requests into 1 url
            Object.forEach(usedFontNames, function (val, fontName) {
                this.resources.W.Css.loadFont(fontName);
            }, this);
        },

        _getUsedFontsInComp: function () {
            var text = this.getDataItem().get('text');
            var div = new Element('div');
            div.innerHTML = text;
            var fontSpans = div.getElements('span[style]');
            var faceElements = div.getElements('font[face]');
            var fontNames = {};
            fontSpans.forEach(function (span) {
                var fontFamily = span.style['font-family'] || span.style['fontFamily'];
                if (fontFamily) {
                    var fontFamilies = this._cleanUpFontName(fontFamily).split(',');
                    for(var i = 0; i < fontFamilies.length; i++){
                        fontNames[fontFamilies[i]] = true;
                    }
                }
            }, this);
            faceElements.forEach(function (fontEl) {
                var fontName = fontEl.getAttribute('face');
                fontName = this._cleanUpFontName(fontName);
                fontNames[fontName] = true;
            }, this);
            return fontNames;
        },
        _cleanUpFontName: function (fontName) {
            return fontName.replace(/['"]/gi, '');
        },

        //////// MOBILE /////////////////////////////////////////////////////////////
        setScale: function(value, dontShrinkComponentHeight) {
            var oldValue = this._$scale;
            var isSmaller = value < oldValue;
            this._$scale = parseFloat(value);
            if (this._isMobile) {
                this._scalingModifier.setScale(this._$scale);
                this._scalingModifier.updateDomAccordingToNewValue();
                if (!dontShrinkComponentHeight && isSmaller) {
                    this._updateComponentHeightAccordingToTextEffectiveHeight();
                }
            }
            this.fireEvent('autoSized', {wasScaleChanged: true});
        },

        _updateComponentHeightAccordingToTextEffectiveHeight: function() {
            var effectiveTextHeight = this._scalingModifier.getEffectiveTextHeight(this);
            this.setHeight(effectiveTextHeight);
        },

        setBrightness: function(value) {
            this._brightness = parseFloat(value);
            this._brightnessModifier.setBrightness(this._brightness);
            this._brightnessModifier.updateDomAccordingToNewValue();
        },

        getBrightness: function() {
            return this._brightness;
        },

        dispose: function(){
            // The edit toolbar is registered as having interest in this component data item
            // thus preventing it from being deleted by the BaseComponent dispose method
            if (this._data) {
                // Remove settings panels from "component with interest" list
                // This is a bit of a hack and we need it since the panels are never disposed and don't even know their own
                // display state. Once this is refactored our life will be easier.
                this._data.componentsWithInterest = _.filter(this._data.componentsWithInterest, function(component){
                    return (component.$className != "wysiwyg.editor.components.panels.WRichTextPanel");
                });
            }
            //Call super
            this.parent();
        },
        setLoading: function(isLoading) {
            if (isLoading) {
                this.getViewNode().addClass('textPreloader');
            } else {
                this.getViewNode().removeClass('textPreloader');
            }
        }
    });

});