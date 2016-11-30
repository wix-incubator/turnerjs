define.component('wysiwyg.common.components.backofficetext.viewer.BackOfficeText', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.propertiesSchemaType('BackOfficeTextProperties');

    def.dataTypes(['BackOfficeText']);

    def.resources(['W.Resources', 'W.Data', 'W.Config']);

    def.skinParts({
        label:{type:'htmlElement'}
    });

    def.fields({
        _canFocus:true,
        _triggers:['click']
    });

    def.methods({

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations,
                data = this.getDataItem();

            if (!!data && invalidations.isInvalidated([
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.STYLE_PARAM_CHANGE,
                this.INVALIDATIONS.SKIN_CHANGE]))
            {
                this._skinParts.label.innerHTML = this._getGlobalValue(data.get('key'));
                this._setTextAlignment();
                this._setTextMargin();
            }
        },

        _getGlobalValue: function(key){
            var languageCode = this._getLanguage(),
                hasGlobals = !!window.componentGlobals,
                hasBackOfficeText = hasGlobals && !!window.componentGlobals.backOfficeText,
                hasLanguage = hasBackOfficeText && !!window.componentGlobals.backOfficeText[languageCode],
                hasEnglish = hasBackOfficeText && !! window.componentGlobals.backOfficeText.en,
                hasLanguageKey = hasLanguage && !!window.componentGlobals.backOfficeText[languageCode][key],
                hasEnglishKey = hasEnglish && !!window.componentGlobals.backOfficeText.en[key];

            if(hasBackOfficeText && hasLanguage && hasLanguageKey){
                return window.componentGlobals.backOfficeText[languageCode][key];
            } else if(hasBackOfficeText && hasEnglish && hasEnglishKey){
                return window.componentGlobals.backOfficeText.en[key];
            } else if (this._isWixUser()){
                return key;
            } else {
                return "";
            }
        },

        _setTextAlignment:function () {
            var align = this.getComponentProperty('align');
            this._skinParts.label.setStyle('text-align', align);
        },

        _setTextMargin:function () {
            var margin = this.getComponentProperty('margin'),
                align = this.getComponentProperty('align');

            /*We change "padding" property even though the variable is called "margin",
            because while padding is what we actually want to change, the naming convention in Wix for this kind of feature is "margin".
            #Gofigure,#HistoricalReasons*/
            if (align === 'left') {
                this._skinParts.label.setStyle('padding-right', '');
                this._skinParts.label.setStyle('padding-left', margin + 'px');
            } else if (align === 'right') {
                this._skinParts.label.setStyle('padding-left', '');
                this._skinParts.label.setStyle('padding-right', margin + 'px');
            } else {
                this._skinParts.label.setStyle('padding-left', '');
                this._skinParts.label.setStyle('padding-right', '');
            }
        },

        _isWixUser: function(){
            var userEmail,
                isSuffix = function (str, suffixToCheck) {
                    return str.indexOf(suffixToCheck) === str.length - suffixToCheck.length;
                },
                isWixEmail = function (email) {
                    return email && isSuffix(email, "@wix.com");
                };

            userEmail = this.resources.W.Config.getUserEmail();
            return isWixEmail(userEmail);
        },

        /**
         * get the current language
         */
        _getLanguage: function(){
            return window.userApi ? window.userApi.getLanguage() : 'en';
        }

    });
});