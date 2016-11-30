define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTFontStyleDependentCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTStyleDependentCommand');

    def.binds(['_onFontReady']);

    def.resources(['W.Commands','W.Utils', 'W.Css']);

    def.methods({
        _getOptionFromMenu: function(value){
            var self = this;
            var canonizedValue = this._canonizeValue(value);

            return this._optionsData.first(function(optionData){
                var optionLabel = self._canonizeValue(optionData.get('label'));
                var optionValue = self._canonizeValue(optionData.get('value'));
                return canonizedValue === optionValue || canonizedValue === optionLabel;
            });
        },

        executeCommand: function(event)  {
            this.parent(event);
            this._changeFontEvent = event;
            if (this._isDefaultOption(event)){
                this._onFontReady();
                this._handleDefaultOptionSelection();
                return;
            }
            var eventData = event.getData(),
                quotesSearchRE = /\"/g,
                requestedFont = eventData.value,
                fontName = requestedFont && requestedFont.split(',')[0].toLowerCase(),
                fontData = this.resources.W.Css.getFontsData()[fontName.replace(quotesSearchRE,'')];

            if (fontData && fontData.provider === "google" || fontData.provider === "system"){
                this._onFontReady();
            } else {
                this.resources.W.Commands.executeCommand('WEditorCommands.toggleFontLoaderImage',true);
                this.waitForWebfont(requestedFont, false, this._onFontReady);
            }
        },

        _handleDefaultOptionSelection: function() {
            var displayedOption = this._getOptionToDisplay(Constants.CkEditor.TRISTATE.OFF);
            this._controllerComponent.getDataItem().set('selected', displayedOption);
        },

        _onFontReady: function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.toggleFontLoaderImage',false);
            if (!this._editorInstance) {
                return;
            }
            var value =  this._changeFontEvent.get(this._key);
            this._editorInstance.execCommand(this._commandName, value);
        },

        waitForWebfont: function(font, isReload, callback) {
            var that = this;
            var node = document.createElement('span');
            // Characters that vary significantly among different fonts
            // + foreign character sets chars for font reload with different character sets
            node.innerHTML = 'giItT1WQy@!-/#Примеבגאمثالрgałąźあア愛Aa미리보기';
            // Visible - so we can measure it - but not on the screen
            node.setStyles({
                'position':       'fixed',
                'left':           '-9900px',
                'top':            '-9900px',
                'fontSize':       '100px', // Large font size makes even subtle changes obvious
                'fontVariant':    'normal',
                'fontStyle':      'normal',
                'fontWeight':     'normal',
                'letterSpacing':  '0',
                'whiteSpace':     'nowrap'
            });

            // make sure fallback font is the same as the fallback in the requested font
            var fallback;
            var fallbackExists = (font.lastIndexOf(',') > -1);
            if (!fallbackExists){
                fallback = 'sans-serif';
            } else {
                fallback = font.substring(font.lastIndexOf(',') + 1);
            }

            fallback += " !important";

            node.style.fontFamily = fallback;
            document.body.appendChild(node);

            // Remember width with no applied web font
            var width = node.offsetWidth;
            node.style.fontFamily = fallbackExists ? font : (font + ',' + fallback);
            var interval;

            //Limit waiting time
            var timeLimit = setTimeout(function(){
                clearInterval(interval);
                node.parentNode.removeChild(node);
                node = null;
                callback();
                that._reportSlowOrMissingFont(font);
            },30*1000);

            function checkFont() {
                if (node && node.offsetWidth !== width) {
                    node.parentNode.removeChild(node);
                    node = null;
                    if (interval) {
                        clearInterval(interval);
                    }
                    clearTimeout(timeLimit);
                    callback();
                    return true;
                }
            }

            if (!checkFont()) {
                interval = setInterval(checkFont, 500);
            }
        },

        _reportSlowOrMissingFont:function(requiredFont){
            LOG.reportError(wixErrors.FONT_LOAD_TIME_GREATER_THAN_30_SECONDS, 'RTFontStyleDependentCommand', 'waitForWebfont',
                {"desc" : 'font ' + requiredFont + ' did not load after 30 seconds'});
        }
    });
});