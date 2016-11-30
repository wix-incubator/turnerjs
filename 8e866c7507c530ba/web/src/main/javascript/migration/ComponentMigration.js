/**
 * Components that were moved to a different package or project, but saved by the server.
 * The override is on the define.Class because Components are classes.
 */

(function(){
    var definitions = {
        'mobile.core.components.BaseList': 'core.components.BaseList',
        'mobile.core.components.Container': 'core.components.Container',
        'mobile.core.components.Image': 'core.components.Image',
        'mobile.core.components.TwitterFollow': 'core.components.TwitterFollow',
        'mobile.core.components.MenuButton': 'core.components.MenuButton',
        'mobile.core.components.Page': 'core.components.Page',
        'mobile.core.components.SimpleButton': 'core.components.SimpleButton',
        'mobile.core.components.SiteStructure': 'core.components.SiteStructure'
    };

    // This code is part of creating new TPA artifact
    // once the artifact will be stable this code will be deleted and the experiment will be merged
    var scriptLoader = define.getDefinition('resource.scriptLoader').value;
    if(!scriptLoader){throw new Error('scriptLoader is not defined');}

    definitions['wysiwyg.viewer.components.tpapps.TPAWidget'] = 'tpa.viewer.components.TPAWidget';
    definitions['wysiwyg.viewer.components.tpapps.TPASection'] = 'tpa.viewer.components.TPASection';
    definitions['wysiwyg.viewer.components.tpapps.TPAPlaceholder']=  'tpa.viewer.components.TPAPlaceholder';
    definitions['wysiwyg.viewer.components.tpapps.TPA3DGallery'] = 'tpa.viewer.components.TPA3DGallery';
    definitions['wysiwyg.viewer.components.tpapps.TPA3DCarousel'] = 'tpa.viewer.components.TPA3DCarousel';
    definitions['wysiwyg.viewer.components.tpapps.TPAGluedWidget'] = 'tpa.viewer.components.TPAGluedWidget';

    define.Class.overrideName.multi(definitions);
}());
