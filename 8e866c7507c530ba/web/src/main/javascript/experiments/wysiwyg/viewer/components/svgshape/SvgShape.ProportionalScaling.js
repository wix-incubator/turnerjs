/**
 * @class wysiwyg.viewer.components.svgshape.SvgShape
 */
define.experiment.component('wysiwyg.viewer.components.svgshape.SvgShape.ProportionalScaling', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.statics({
        EDITOR_META_DATA: strategy.merge({
            general: { proportionalResize: true }
        })
    });
});