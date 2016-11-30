/**
 * Show a confirmation message to the user before exiting the editor
 */
(function(context){

    context.enableNavigationConfirmation = !/leavePagePopUp=false/i.test(window.location.search) && !/annoy=false/i.test(window.location.search);
    context.enableRightClickContextMenu = window.location.search.indexOf('rcm=true') >= 0;
    resource.getResources(['tags', 'W.Utils'], function(res){
        if(~res.tags.indexOf('test')){
            context.enableNavigationConfirmation = false;
        }
    });



    var currentOnBeforeUnload = window.onbeforeunload;

    function getWarningPopUpMessage(e){
        var defaultMessage = 'Note: Any unsaved changes will be lost';
        var message;

        // Conditions are separated to several ifs because of different 'else' actions.
        if (window.W && W.Resources){
            if (W.Config && W.Config.env.isEditorInPreviewMode()){
                message = W.Resources.get('EDITOR_LANGUAGE', 'EDITOR_PREVIEW_EXIT_ALERT_LEFT');
            } else {
                message = W.Resources.get('EDITOR_LANGUAGE', 'EDITOR_EXIT_ALERT', defaultMessage);
            }
        } else {
            message = defaultMessage;
        }

        if (context.enableNavigationConfirmation) {
            e = e || window.event;
            if (e){
                // IE and FireFox prior to version 4
                e.returnValue = message;
            }
            // Safari & Chrome
            return message;
        }
    }

    window._onExitCallbacks_ = window._onExitCallbacks_ || [];
    window._onExitCallbacks_.push(getWarningPopUpMessage);


    window.onbeforeunload = function(e){
        if (typeof currentOnBeforeUnload === 'function'){
            currentOnBeforeUnload(e);
        }
        var popupMessage;
        if (window._onExitCallbacks_){
            for (var i = 0, max = window._onExitCallbacks_.length; i < max; i++){
                popupMessage = window._onExitCallbacks_[i](e);
                if(popupMessage) {
                    return popupMessage;
                }
            }
        }
    };

}(window));
