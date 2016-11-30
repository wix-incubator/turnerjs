define.Class("external_apis.FacebookPixelScript", function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Config']);

    def.methods({
        initialize: function() {
            //we only want to fire this script on the very first time that the user opens an editor. since we don't have exactly that, we'll see if this is a template being opened, and if the user has any previously saved documents
            if (this._thisSiteWasAlreadySaved() || this._userAlreadySavedOtherSites()) {
                return;
            }

            window.fb_param = {};
            window.fb_param.pixel_id   = '6010554253282';
            window.fb_param.value      = '0.00';
            window.fb_param.currency   = 'USD';

            var firstScriptNode = document.getElementsByTagName('script')[0];

            this._addFPScript(firstScriptNode);
        },

        _addFPScript: function (firstScriptNode) {
            var fpw = document.createElement('script');
            fpw.async = true;
            fpw.src = '//connect.facebook.net/en_US/fp.js';
            firstScriptNode.parentNode.insertBefore(fpw, firstScriptNode);
        },

       _thisSiteWasAlreadySaved: function _thisSiteWasAlreadySaved() {
           return !this.resources.W.Config.siteNeverSavedBefore();
       },

       _userAlreadySavedOtherSites: function _userAlreadySavedOtherSites() {
           var umsn = this.resources.W.Config.getEditorModelProperty('usedMetaSiteNames');
           if(!_.isArray(umsn))
                return false;
           return umsn.length > 0;
       }
    });
}) ;