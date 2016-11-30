/**@class wysiwyg.editor.components.BaseNavigationButton */
define.experiment.component('wysiwyg.editor.components.BaseNavigationButton.CustomSiteMenu', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.statics({
        _iconsPosition: {
            _visible: "-9999px -9999px",
            _hidden: "0 -2px",
            homepage_visible: "0 -112px",
            homepage_hidden: "0 -131px",
            header_visible: "0 -69px",
            header_hidden: "0 -92px",
            link_visible: "0 -22px",
            link_hidden: "0 -46px"
        },
        _INDENT: 20
    });

});
