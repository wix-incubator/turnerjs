/**
 * @class wysiwyg.editor.commandregistrars.SaveCommandRegistrar
 */
define.Class('wysiwyg.editor.managers.WCommandRegistrar', function(classDefinition){
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.utilize([
        'wysiwyg.editor.commandregistrars.EditCommandRegistrar',
        'wysiwyg.editor.commandregistrars.SaveCommandRegistrar',
        'wysiwyg.editor.commandregistrars.OpenDialogCommandRegistrar',
        'wysiwyg.editor.commandregistrars.OpenPanelCommandRegistrar',
        'wysiwyg.editor.commandregistrars.PageManipulationCommandRegistrar',
        'wysiwyg.editor.commandregistrars.AccountCommandRegistrar',
        'wysiwyg.editor.commandregistrars.ComponentCommandRegistrar',
        'wysiwyg.editor.commandregistrars.EditorCommandRegistrar',
        'wysiwyg.editor.commandregistrars.MobileEditorBIEventsCommandRegistrar'
    ]);
    def.resources(['W.Commands', 'W.Preview', 'W.InputBindings']);
    def.binds(['_suppressUnboundBackspace']);
    def.methods({
        initialize: function(){
            this._editCommandRegistrar = new this.imports.EditCommandRegistrar();
            this._saveCommandRegistrar = new this.imports.SaveCommandRegistrar();
            this._openDialogCommandRegistrar = new this.imports.OpenDialogCommandRegistrar();
            this._openPanelCommandRegistrar = new this.imports.OpenPanelCommandRegistrar();
            this._pageManipulationCommandRegistrar = new this.imports.PageManipulationCommandRegistrar();
            this._accountCommandRegistrar = new this.imports.AccountCommandRegistrar();
            this._componentCommandRegistrar = new this.imports.ComponentCommandRegistrar();
            this._editorCommandRegistrar = new this.imports.EditorCommandRegistrar();

            this._ignoreKeyhandlerInTags = null; //Value set in W.InputKeyBindings;
            this._mobileEditBIEventsCommandRegistrar = new this.imports.MobileEditorBIEventsCommandRegistrar() ;
        },

        //############################################################################################################
        //#   P U B L I C   M E T H O D S
        //############################################################################################################

        /**
         * Register all editor commands
         */
        registerCommands: function(){
            this.resources.W.Commands.registerCommand("EditorCommands.SiteLoaded");

            this._editCommandRegistrar.registerCommands();
            this._saveCommandRegistrar.registerCommands();
            this._openDialogCommandRegistrar.registerCommands();
            this._openPanelCommandRegistrar.registerCommands();
            this._pageManipulationCommandRegistrar.registerCommands();
            this._accountCommandRegistrar.registerCommands();
            this._componentCommandRegistrar.registerCommands();
            this._editorCommandRegistrar.registerCommands();
            this._mobileEditBIEventsCommandRegistrar.registerCommands() ;
        },

        /**
         * Set all global editor hotkeys
         */
        setKeyboardEvents: function(){
            this._editCommandRegistrar.setKeyboardEvents();
            this._saveCommandRegistrar.setKeyboardEvents();
            this._componentCommandRegistrar.setKeyboardEvents();

            window.addEvent('keydown', this._suppressUnboundBackspace);
            window.addEvent('keydown', this._suppressUnboundSave);

            if (Browser.firefox) {
                window.addEvent('keydown', this._suppressEditorSelectAll);
            }

            this.resources.W.Preview.getPreviewSite().addEvent('keydown', this._suppressUnboundBackspace);
        },

        /**
         * Prevent the editor from navigating back to previews page in browser history.
         * @param event
         * @return {Boolean}
         * @private
         */
        _suppressUnboundBackspace: function(event){
            if (event && event.key == 'backspace'){ // If backspace
                var keysDisabled = !W.Editor.getKeysEnabled();
                var noComponentSelected = !W.Editor.getEditedComponent();
                if (keysDisabled || noComponentSelected){ //If not in component editing context
                    if (!this.resources.W.InputBindings.isStopCallback(event, event.target, event.key, true)){ // If not inside a form element
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                }
            }
        },

        /**
         * Prevent browser "save page as" action
         * @param event
         * @return {Boolean}
         * @private
         */
        _suppressUnboundSave: function(event){
            if ((event.control || event.meta) && !event.alt && event.key == 's'){ // If ctrl+s
                if (!W.Editor.getKeysEnabled()){ //If our custom ctrl+s is paused
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }
            }
        },

        /**
         * Prevent user selection using ctrl+a ( except inputs and textarea's )
         * Pressing ctrl+a on Firefox selects the text despite having the '-moz-user-select: none' css rule
         * This is an open bug - https://bugzilla.mozilla.org/show_bug.cgi?id=739396
         * The function should be deprecated once mozilla fixes the issue
         *
         * @param event
         * @returns {boolean}
         * @private
         */
        _suppressEditorSelectAll: function(event) {
            if ((event.control || event.meta) && event.key === 'a'){
                if (event.target.nodeName !== 'INPUT' && event.target.nodeName !== 'TEXTAREA') {
                    event.preventDefault();
                    return false;
                }
            }
        },

        enableEditCommands: function(isEnabled){
            this._editCommandRegistrar.enableEditCommands(isEnabled);
            this._componentCommandRegistrar.enableEditCommands(isEnabled);
        }
    });

});
