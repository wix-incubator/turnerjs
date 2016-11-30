define.skin('wysiwyg.common.components.facebooklikebox.viewer.skins.FacebookLikeBoxSkin', function(skinDefinition){
    var def = skinDefinition;
    def.inherits('core.managers.skin.BaseSkin2');
    def.iconParams({'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/xxx.png', 'hidden': false, 'index': 0});
    def.skinParams([
        {'id':'pos','type':Constants.SkinParamTypes.OTHER, 'defaultValue':'position:absolute; top:0; bottom:0; left:0; right:0;'},
        {'id': 'themeDir', 'type': 'themeUrl', 'defaultTheme': 'THEME_DIRECTORY', 'name': ''}
    ]);

    def.html('<div skinPart="likeboxContainer"><div class="loadImg" skinPart="fbLikeLoad"><div></div></div><iframe skinpart="iframe" onload="setTimeout(function(){ var images = document.getElementsByClassName(\'loadImg\'); _.each(images, function(img) {img.style.display = \'none\'}); }, 700);" allowTransparency="true" scrolling="no"></iframe></div>');

    def.css([
        '%likeboxContainer% {[pos] }',
        '[state~=bgStyle-light] %likeboxContainer% { background-color: white; }',
        '[state~=bgStyle-dark]  %likeboxContainer% { background-color: black; }',
        '[state~=bgStyle-noBg]  %likeboxContainer% { background-color: transparent; }',
        '%iframe% { border:none; box-sizing:border-box; width:100%; height:100%; overflow-x: hidden; overflow-y: hidden }',
        '%fbLikeLoad% {position:absolute;z-index:999;top:0;left:0;right:0;bottom:0;}',
        '%fbLikeLoad% div {position:absolute;z-index:999;top:0;left:0;right:0;bottom:0;background:url([themeDir]gif_preloader.gif) center no-repeat;}'
    ]);
});