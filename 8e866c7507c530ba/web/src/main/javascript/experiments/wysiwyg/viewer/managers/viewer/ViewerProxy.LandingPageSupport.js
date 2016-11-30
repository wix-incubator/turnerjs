define.experiment.Class('wysiwyg.viewer.managers.viewer.ViewerProxy.LandingPageSupport', function(def){

    def.methods({
        addEventPropagation: function (eventName){
            var self = this;
            this._eventHandlers[eventName] = function(args){
                self.fireEvent(eventName, args);
                self.trigger(eventName, args); //note that the new events trait is in WViewManager
            };
            this._activeViewer_.addEvent(eventName, this._eventHandlers[eventName]);
        }
    });
});