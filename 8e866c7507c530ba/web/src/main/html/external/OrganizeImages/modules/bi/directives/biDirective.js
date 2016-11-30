/*global window, document, $, Wix, angular, translation*/

/**
 * Directive for the collecting and sending BI events
 * @directive biEvent
 */
bi.directive('biEvent', ['biService', function(biService){
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs){
            /** Bind method */
            var bind = 'on';
            /** Event type to listen to */
            var type = $attrs.biEventType || 'click';

            if ($attrs.biEventBind === 'once') {
                bind = 'one';
            }

            $element[bind](type, function(){
                if (!$attrs.biEventCollect){
                    biService.sendBiEvent($attrs.biEvent, $attrs.biEventParam);
                } else{
                    biService.collectChanges({
                        biEvent: $attrs.biEvent,
                        biEventParam: $attrs.biEventParam,
                        biEventBind: $attrs.biEventBind,
                        biEventType: $attrs.biEventType,
                        biEventEl: $element[0]
                    });
                }
            });
        }
    };
}]);