
define.Class('wysiwyg.editor.managers.undoredomanager.LayoutChange', function(classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Preview']);

    def.methods({

        startListen: function() {
            this.resources.W.Preview.getPreviewManagers().Layout.addEvent('updateAnchors', this._onChange);
        },

        stopListen: function() {
            this.resources.W.Preview.getPreviewManagers().Layout.removeEvent('updateAnchors', this._onChange);
        },

        undo: function(changeData) {
            if (!changeData.oldAnchors || changeData.oldAnchors.length==0) {
                return true;
            }

            var anchors = this._deSerializeData(changeData, true);
            this._replaceComponentAnchors(anchors.compRef, anchors.anchorsToUse);
            return true;
        },

        redo: function(changeData) {
            if (!changeData.newAnchors || changeData.newAnchors.length==0) {
                return true;
            }

            var anchors = this._deSerializeData(changeData, false);
            this._replaceComponentAnchors(anchors.compRef, anchors.anchorsToUse);
            return true;
        },

        _deSerializeData: function(data, isUndo) {
            var fromComp = this.injects().Preview.getCompByID(data.changedComponentIds[0]).$logic;

            var anchors = isUndo? this.injects().Preview.getPreviewManagers().Layout.deserializeAnchors(data.oldAnchors, fromComp):
                this.injects().Preview.getPreviewManagers().Layout.deserializeAnchors(data.newAnchors, fromComp);

            return {
                compRef: fromComp,
                anchorsToUse: anchors
            };
        },

        _replaceComponentAnchors: function(component, deSerializedAnchors) {
            this._removeReverseAnchorsFromTargetComponent(component);
            component.setAnchors(deSerializedAnchors);
        },

        _removeReverseAnchorsFromTargetComponent: function(component) {
            var currentAnchors = component.getAnchors();

            currentAnchors.each(function(anchor) {
                this._removeSingleAnchorFromTargetComponent(anchor);
            }.bind(this));
        },

        _removeSingleAnchorFromTargetComponent: function(anchor) {
            var targetComponent = anchor.toComp;
            var reverseAnchors = targetComponent.getReverseAnchors();
            var anchorIndex = reverseAnchors.indexOf(anchor);
            reverseAnchors.splice(anchorIndex, 1);
        }


    });
});
