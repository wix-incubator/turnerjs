//(function(){
//
//// use a factor for fine tuning of timeouts and for debugging
////var factor = 1.5; //for debugging, you can change this for example to 0.0001. just remember to change it back!!
////for now, i've made it 1.5 just so that we get less timeouts and can then analyze them
////TODO: attach this to a general debug variable, to avoid mistakes!
//
////for now, we'll just use one timeout. left the line above so that it would be easy to revert back to the 'per component' version
//Constants.WixifyTimeOut = 20000; //{
////    'core.components.Button'                     : 2000 * factor,
////    'wysiwyg.editor.components.ComponentEditBox'        : 2500 * factor,
////    'wysiwyg.editor.components.ContainerHighLight'      : 2000 * factor,
////    'wysiwyg.editor.components.EditModeStateBar'        : 1000 * factor,
////    'wysiwyg.editor.components.EditorUI'                : 9000 * factor,
////    'wysiwyg.editor.components.SitePageButton'          : 1000 * factor,
////    'wysiwyg.editor.components.Tabs'                    : 2000 * factor,
////    'wysiwyg.editor.components.ToolTip'                 : 2200 * factor,
////    'wysiwyg.editor.components.WEditorPreview'          : 1400 * factor,
////    'wysiwyg.editor.components.WSitePageController'     : 2200 * factor,
////    'wysiwyg.editor.components.panels.ComponentPanel'   : 500  * factor,
////    'wysiwyg.editor.components.panels.PagesPanel'       : 500  * factor,
////    'wysiwyg.editor.components.panels.base.SidePanel'   : 2400 * factor,
////    'wysiwyg.editor.components.richtext.WRichTextEditor': 1400 * factor
////};
//
//})();

define.Const('WixifyTimeOut', 20000);