/**
 * @class wysiwyg.viewer.components.traits.IframeUtils
 */
define.Class('wysiwyg.viewer.components.traits.IframeUtils', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        setIFrameSrc: function(iframe,url){
            if (url !== iframe.src){
                this._setIFrameSrcWithoutAffectingHistory(iframe,url);
            }
        },

        _setIFrameSrcWithoutAffectingHistory: function(iframe, url){
            var parentViewNode = iframe.parentNode;
            if(parentViewNode){
                parentViewNode.removeChild(iframe);
                iframe.src = url;
                parentViewNode.appendChild(iframe);

                var enableNavigationConfirmation = !/leavePagePopUp=false/i.test(window.location.search);
                if (enableNavigationConfirmation) {
                    var scrElem = document.createElement('script');
                    scrElem.text = 'window.onbeforeunload = function(e) { return \'You are about to be redirected to another site. Are you sure you want to do it?.\'; };';
                    parentViewNode.appendChild(scrElem);
                }

            } else{
                iframe.src = url;
            }

        }


    });
});
