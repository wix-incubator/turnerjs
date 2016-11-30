/**
 * @Class wysiwyg.editor.components.panels.HeaderContainerPanel
 * @extends wysiwyg.editor.components.panels.FixedSiteSegmentContainerPanel
 */
define.component('wysiwyg.editor.components.panels.HeaderContainerPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.FixedSiteSegmentContainerPanel");

    /**
     * @lends wysiwyg.editor.components.panels.HeaderContainerPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){

            /** The panel keys here are passed as args to the parent panel, which is FixedSiteSegmentContainerPanel
             * The parent panel uses these keys to display custom information, but the panel structure is the same **/
            args.panelKeys = {
                checkBoxLabel: 'FIXED_POSITION_LABEL',
                helpInfo: 'FIXED_POSITION_HELPINFO_NEW_HEADER',
                toolTipId: 'HeaderContainer_Fixed_Position_ttid'
            };
            this.parent(compId, viewNode, args);
        }

    });
});