define.component('Editor.wysiwyg.common.components.domainsearchbar.viewer.DomainSearchBar', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.panel({
        logic: 'wysiwyg.common.components.domainsearchbar.editor.DomainSearchBarPanel',
        skin: 'wysiwyg.common.components.domainsearchbar.editor.skins.DomainSearchBarPanelSkin'
    });

    def.styles(1);

    def.methods({});

});