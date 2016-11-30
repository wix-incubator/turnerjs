/**
 * @class wysiwyg.editor.components.richtext.TextFontsHandler
 */
define.Class('wysiwyg.editor.components.richtext.TextFontsHandler', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Preview']);

    def.fields({
        _ckEditor: null,
        _loadedFonts: {}
    });

    def.methods({
        initialize: function(){
            this.resources.W.Preview.getPreviewManagersAsync(function(managers){
                this._viewer = {
                    css: managers.Css
                };
            }, this);
        },

        //maybe we should sync the fonts on start editinig...
        setCkEditorInstance: function(editor){
            this._ckEditor = editor;
            this._ckEditor.on('instanceReady',this._initCk, this);
            this._ckEditor.isReady && this._initCk();
        },

        _initCk: function(){
            this._ckEditor.on('beforeCommandExec', this._loadFont, this);
        },

        startEditing: function(){
            this._loadMissingExistingFonts();
        },

        _loadMissingExistingFonts: function(){
            //var missingFontsObj = this._viewer.css.getMissingUsedFontsUrl(this._loadedFonts);
            //this, I hope temp change is beacause the wysArea plugin is rewriting the whole html in the iframe on set data..
            var missingFontsObj = this._viewer.css.getCustomUsedFontsUrl();
            if(missingFontsObj){
                Object.append(this._loadedFonts, missingFontsObj.missingFontsNames);
                this._appendStyleSheet(missingFontsObj.missingFontsUrl);
            }
            //Wix CDN stored fonts
            var urls = this._viewer.css.getWixStoredFontsCssUrls();
            for(var i = 0; i < urls.length; i++){
                this._appendStyleSheet(urls[i]);
            }
        },

        _loadFont: function(evtData){
            var cmdName = evtData.data.name;
            if(cmdName !== 'fontFamily'){
                return;
            }
            var cmdValue = evtData.data.commandData;
            var fontNames = cmdValue.toString().split(',');
            for(var i = 0; i < fontNames.length; i++){
                var fontName = fontNames[i];
                if(this._loadedFonts[fontName]){
                    return;
                }
                var url = this._viewer.css.getFontUrl(fontName);
                if(url){
                    this._loadedFonts[fontName] = fontName;
                    this._appendStyleSheet(url);
                }
            }
        },

        _appendStyleSheet: function(url){
            var doc = this._ckEditor.editable().getDocument();
            doc.appendStyleSheet(url);
        }
    });

});