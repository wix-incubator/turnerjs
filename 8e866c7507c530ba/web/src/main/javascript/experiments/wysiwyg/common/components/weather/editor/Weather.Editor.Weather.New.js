define.experiment.component('Editor.wysiwyg.common.components.weather.viewer.Weather.Weather.New', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.panel({
        logic: 'wysiwyg.common.components.weather.editor.WeatherPanel',
        skin: 'wysiwyg.common.components.weather.editor.skins.WeatherPanelSkin'
    });

    def.styles(2);

    def.helpIds({
        componentPanel: '/node/18990',
        chooseStyle : ''
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true
            }
        }
    });

    def.methods({
    });

});
