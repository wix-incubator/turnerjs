/** @class wysiwyg.editor.components.EditLayerPresenter */
define.component("wysiwyg.editor.components.EditLayerPresenter", function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Commands', 'W.Utils']);

    def.utilize(['core.managers.components.ComponentBuilder']) ;

    def.states({
        areaHighLight: ['non-displayed', 'displayed']
    });

    def.skinParts({
        gridLines               : {type: 'wysiwyg.editor.components.StaticGridLines'},
        mouseEventCatcher       : {type: 'wysiwyg.editor.components.MouseEventCatcher'},
        componentEditBox        : {type: 'htmlElement'},
        containerHighLight      : {type: 'wysiwyg.editor.components.ContainerHighLight'},
        parentContainerHighlight: {type: 'wysiwyg.editor.components.ContainerHighLight', argObject: {highlightContainerType: "parentContainer"}},
        areaHighLight           : {type: 'htmlElement'},
        rulerHoriz              : {type: 'wysiwyg.editor.components.Ruler', argObject: {orientationHorizontal: true}},
        rulerVert               : {type: 'wysiwyg.editor.components.Ruler', argObject: {orientationHorizontal: false}},
        graphicsContainer       : {type: 'wysiwyg.editor.components.GraphicsLayer'}
    });

    def.binds(['_onComponentMoveStart', '_onComponentMoveEnd']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._rulersState = null ;
        },

        _onRender: function(renderEvent) {
            this._createEditBoxOnPart() ;
            if (renderEvent.data.invalidations.getInvalidationByType('skinChange')) {
                this.setState('non-displayed', 'areaHighLight');
            }
            if (renderEvent.data.invalidations.getInvalidationByType('skinChange')) {
                this.setState('non-displayed', 'areaHighLight');
            }
        },

        _createEditBoxOnPart: function(){
            var skinPart = this._skinParts.componentEditBox ;
            var builder = new this.imports.ComponentBuilder(skinPart).
                withType('wysiwyg.editor.components.ComponentEditBox').
                withSkin('wysiwyg.editor.skins.ComponentEditBoxSkin').
                withArgs({gridLines: this._skinParts.gridLines}) ;
            builder.create() ;
        },

        getComponentEditBox: function() {
            return this._skinParts.componentEditBox ;
        },

        /**
         * @returns {wysiwyg.editor.components.StaticGridLines} - Grid Lines of the Editing Layer.
         */
        getGridLines: function() {
            return this._skinParts.gridLines ;
        },

        registerComponentToAreaHighLight: function(component, dimensions) {
            component.addEvent('componentMoveStart', this._onComponentMoveStart);
            component.addEvent('componentMoveEnd', this._onComponentMoveEnd);
            this._skinParts.areaHighLightLabel.set('text', W.Resources.get('EDITOR_LANGUAGE', 'AREA_HIGHLIGHT_FIX_POSITION'));
            if (dimensions) {
                this._skinParts.areaHighLight.setStyles(dimensions);
            }
        },

        unRegisterComponentToAreaHighLight: function(component) {
            component.removeEvent('componentMoveStart', this._onComponentMoveStart);
            component.removeEvent('componentMoveEnd', this._onComponentMoveEnd);
        },

        _onComponentMoveStart: function() {
            this.setState('displayed', 'areaHighLight');
        },

        _onComponentMoveEnd: function() {
            this.setState('non-displayed', 'areaHighLight');
        },

        _hideRulersAndRememberState: function() {
            this._rulersState = this._areRulersTurnedOn();
            this.setRulersToPreviewMode(true);
        },

        _restoreRulersAccordingToState: function() {
            if (this._rulersState) {
                this.setRulersToPreviewMode(false);
            }
        },

        _areRulersTurnedOn: function() {
            return this._skinParts.rulerHoriz.isRulerTurnedOn() &&
                this._skinParts.rulerHoriz.isRulerTurnedOn();
        },

        setRulersToPreviewMode: function(isPreviewMode) {
            this._skinParts.rulerHoriz.previewMode(isPreviewMode);
            this._skinParts.rulerVert.previewMode(isPreviewMode);
        },

        getRulerGuides: function() {
            var result = {};
            if (this._skinParts.rulerHoriz.isVisible()) {
                result.horizontalLeft = this._skinParts.rulerHoriz.getGuidesLeft();
                result.horizontal = this._skinParts.rulerHoriz.getCurrentGuides();
            }

            if (this._skinParts.rulerVert.isVisible()) {
                result.vertical = this._skinParts.rulerVert.getCurrentGuides();
            }

            return result;
        }
    });
});