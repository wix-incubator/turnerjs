try{
(function(){

    var page_scripts = document.getElementsByTagName("script");
    var scripts_src;
    for(var i in page_scripts) {
        var url = page_scripts[i].src;
        if(url && url.indexOf("preload_scripts") > 0){
            scripts_src = url;
        }
    }
    var version = scripts_src.match(/((\d+\.)+\d+)/g)[0];

    if (window.localStorage) {
        var editorVersion = localStorage.getItem("editorVersion");
        if(editorVersion  == version){
            return;  //no need for preload
        }else{
            localStorage.setItem("editorVersion",version); //set the current version in local storage for subsequent requests and continue for preload
        }

    }
    var baseUrl = scripts_src.substring(0,  scripts_src.indexOf("bootstrap"));

    var scripts = [
        baseUrl + "bootstrap/" + version + "/libsExtentions.min.js",
        baseUrl + "bootstrap/" + version + "/javascript/bootstrap.min.js",
        baseUrl + "bootstrap/" + version + "/javascript/basics.min.js",
        baseUrl + "bootstrap/" + version + "/libs.min.js",
        baseUrl + "bootstrap/" + version + "/deployment.min.js",
        baseUrl + "core/"      + version + "/core.min.js",
        baseUrl + "core/"      + version + "/javascript/core.min.js",
        baseUrl + "core/"      + version + "/javascript/coreEditor.min.js",
        baseUrl + "skins/"     + version + "/javascript/viewerSkinExperiments.min.js",
        baseUrl + "skins/"     + version + "/javascript/editorSkinExperiments.min.js",
        baseUrl + "skins/"     + version + "/editorSkin.min.js",
        baseUrl + "skins/"     + version + "/viewerSkinData.min.js",
        baseUrl + "web/"       + version + "/javascript/editorExperiments.min.js",
        baseUrl + "web/"       + version + "/wysiwyg.min.js",
        baseUrl + "web/"       + version + "/javascript/editor.min.js",
        baseUrl + "web/"       + version + "/javascript/viewereditor.min.js",
        baseUrl + "web/"       + version + "/javascript/viewer.min.js",
        baseUrl + "web/"       + version + "/javascript/viewerExperiments.min.js",
        baseUrl + "web/"       + version + "/javascript/commonExperiments.min.js",
        baseUrl + "web/"       + version + "/libs/hammer.min.js",
        baseUrl + "web/"       + version + "/deployeditor.min.js",
        baseUrl + "web/"       + version + "/deployviewer.min.js"
    ];

    var img_src = [
        baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/base/arrows_white_new3.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/maineditortabs/dark-icon-sprite.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/toolbar/toolbar_states_new.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/icons/help_sprite.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/editingFrame/pusher.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/icons/top-bar-icons.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/maineditortabs/dark-help-sprite.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/editingFrame/lock_btn.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/editingFrame/smart_drag.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/maineditortabs/dark-logo-yellow.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/button/fpp-buttons-icons.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/panel/gradients_for_main_nav.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/editingFrame/bb-default-bottom.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/editingFrame/bb-default-left.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/editingFrame/bb-default-top.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/icons/property-panel-help.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/button/fpp-buttons-bg.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/maineditortabs/dark-divider.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/base/editor_helpers/grid_h.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/base/editor_helpers/grid_v.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/editingFrame/hendles-sprite.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/button/pages-dd-bg.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/editingFrame/bb-default-right.png",
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/maineditortabs/dark-icon-bg-color-sprite.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/editingFrame/minimum_line_prt.png"
        ,baseUrl + "skins/" + version + "/images/wysiwyg/core/themes/editor_web/toolbar/menu_border_gradient.png"
        ,baseUrl + "web/" + version + "/images/web/beta.png"
        ,"//static.parastorage.com/media/b1cd13f9d4dfb1450bbb325285106177.png_128"
        ,"//static.parastorage.com/media/01113281ebb7dfb57a8dc2a02eb1cb92.png_128"
    ];

    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var body = document.getElementsByTagName("body")[0] || document.documentElement;

    var loadScript = function(url) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        head.appendChild(script);
    };

    var loadImages = function(url) {
        var img = document.createElement("img");
        img.src = url;
        body.appendChild(img);
    };

    scripts.forEach(loadScript);
    img_src.forEach(loadImages);

})();
}catch(e){};