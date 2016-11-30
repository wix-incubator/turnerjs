define.Class('wysiwyg.viewer.utils.GalleryUtils' , function(def){

    def.methods({
        createActionQueue : function (conditionFunc, maxLength) {
            var queue = [];

            return function (action) {
                if (action) {
                    queue.push(action);
                }

                while (queue.length > 0 && conditionFunc() === true) {
                    if (queue.length > maxLength) {
                        queue.splice(0, queue.length - maxLength);
                    }
                    var nextAction = queue.shift();
                    if(nextAction) {
                        nextAction.call();
                    }
                }
            };
        },
        createMinimalGalleryDisplayer : function (element, dataItem) {
            var guid = Number.random(0, 99999).toString(36);
            var minimalLogic = {
                getViewNode : function () {
                    return element;
                },

                getRef : function () {
                    return guid;
                },

                getDataItem : function () {
                    return dataItem;
                },

                setOwner : function () {
                },

                invalidateSize : function () {
                },

                setSize : function (width, height) {
                    var styleDef = {
                        "width": width,
                        "height": height
                    };
                    element.setStyles(styleDef);
                },

                dispose : function () {
                    element.destroy();
                    element = null;
                }
            };

            element.getLogic = function () { return minimalLogic; };
        }
    });

});