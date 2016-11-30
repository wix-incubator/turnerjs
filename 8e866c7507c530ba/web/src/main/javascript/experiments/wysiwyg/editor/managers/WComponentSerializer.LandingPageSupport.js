define.experiment.Class('wysiwyg.editor.managers.WComponentSerializer.LandingPageSupport', function (def) {

    def.methods({
        _getLayoutDataFromComponentLogic: function(componentLogic) {
            var ret;
            if (componentLogic) {
                ret = {
                    x: componentLogic.getX(),
                    y: componentLogic._getSerializedY ? componentLogic._getSerializedY() : componentLogic.getY(),
                    width: componentLogic.getWidth(),
                    height: componentLogic._getSerializedHeight ? componentLogic._getSerializedHeight() : componentLogic.getHeight(),
                    scale: componentLogic.getScale ? componentLogic.getScale() : undefined,
                    rotationInDegrees: componentLogic.getAngle ? componentLogic.getAngle() : undefined,
                    fixedPosition: false
                };

                if (componentLogic.canBeFixedPosition() && componentLogic.getLayoutPosition() === 'fixed') {
                    ret.fixedPosition = true;
                }
            }
            else {
                ret = {x: 0, y: 0, width: 0, height: 0, scale: 1, angle: 0};
            }
            return ret;
        }
    });
});
