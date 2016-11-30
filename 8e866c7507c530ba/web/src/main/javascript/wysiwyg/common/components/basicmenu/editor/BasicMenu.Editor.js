define.component('Editor.wysiwyg.common.components.basicmenu.viewer.BasicMenu', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.traits([
        'wysiwyg.common.components.basicmenu.editor.traits.BasicMenuDataHandler',
        'wysiwyg.common.components.basicmenu.editor.traits.MenuDomBuilder',
        'wysiwyg.common.components.basicmenu.viewer.traits.MenuElementsParser'
    ]);
});