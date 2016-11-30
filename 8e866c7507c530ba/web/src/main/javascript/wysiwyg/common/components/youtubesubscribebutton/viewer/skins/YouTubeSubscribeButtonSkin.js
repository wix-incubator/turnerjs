define.skin('wysiwyg.common.components.youtubesubscribebutton.viewer.skins.YouTubeSubscribeButtonSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.skinParams([]);

    def.html(
        '<div skinPart="youtubeIframe">' +
            '<div skinPart="hitWidth" class="hitOutVertical"></div>'+
            '<div class="hitOutHorizontal"></div>'+
            '</div>'

    );

    def.css([
        '%youtubeIframe% {height: 66px;display:inline-block;position:absolute;font-size:0;line-height:0;}',
        '[state~=nonHover]  %youtubeIframe% { z-index:0;}',
        '[state~=hover] %youtubeIframe% { z-index:2; }',
        '%.hitOutVertical%   {  right:0px;position:absolute;  height:100%;z-index:10;}',
        '%.hitOutHorizontal% { bottom:0px;position:absolute; width:100%;z-index:10;}',
        '[state~=default] %.hitOutVertical%   { left:130px}',
        '[state~=default] %.hitOutHorizontal% { top:33px}',
        '[state~=full] %.hitOutVertical%      { left:190px;height:53px}',
        '[state~=full] %.hitOutHorizontal%    { top:55px;}',
        '[state~=defaultIE] %.hitOutVertical%   { left:141px}',
        '[state~=defaultIE] %.hitOutHorizontal% { top:38px}',
        '[state~=fullIE] %.hitOutVertical%      { left:202px;height:65px}',
        '[state~=fullIE] %.hitOutHorizontal%    { top:67px;}'



    ]);
});