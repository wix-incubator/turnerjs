define.skin('mock.viewer.skins.AudioPlayerMockSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.html(
            '<ul>' +
            '<li skinPart="playButton">play</li>' +
            '<li skinPart="pauseButton">pause</li>' +
            '<li skinPart="stopButton">stop</li>' +
            '</ul>');

});