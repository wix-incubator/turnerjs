define.component('wysiwyg.viewer.components.HeaderContainer', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.viewer.components.SiteSegmentContainer");

    def.traits(['wysiwyg.viewer.components.traits.FixedComponentTrait']);

});