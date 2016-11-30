/**
 * @class wysiwyg.viewer.components.VerticalLine
 */
define.component('wysiwyg.viewer.components.VerticalLine', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

//    def.binds(['render']);

    def.fields({
        _renderTriggers: [ Constants.DisplayEvents.SKIN_CHANGE ]
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    /**
     * @lends wysiwyg.viewer.components.VerticalLine
     */
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._resizableSides = [Constants.BaseComponent.ResizeSides.TOP, Constants.BaseComponent.ResizeSides.BOTTOM];
            this._rotatable = true;
        },

        _onRender: function (renderEvent) {
            var contentWidth = this._skinParts.line.$measure.width;
            this.setWidth(contentWidth);
        },

        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.PART_SIZE
            ];
            return invalidations.isInvalidated(renderTriggers);
        },

        setHeight: function (value, forceUpdate, triggersOnResize) {
            var numberOfKnobs = this._getNumberOfKnobs();
            this.height = value;
            this.parent(value, forceUpdate, triggersOnResize);
        },

        _getNumberOfKnobs: function () {
            var value = 0;
            if (this._skinParts) {
                if (this._skinParts.bottomKnob) {
                    value++;
                }
                if (this._skinParts.topKnob) {
                    value++;
                }
                if (this._skinParts.middleKnob) {
                    value++;
                }
            }
            return value;
        }
    });
});