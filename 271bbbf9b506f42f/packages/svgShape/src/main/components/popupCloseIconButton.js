define([
    'lodash',
    'svgShape/components/svgShape',
    'santaProps'
], function (
    _,
    svgShape,
    santaProps
) {
    "use strict";

    var popupCloseIconButton = _.cloneDeep(svgShape);

    function onClick() {
        this.props.closePopupPage();
    }

    popupCloseIconButton.propTypes = _.defaults({
        closePopupPage: santaProps.Types.popup.close
    }, svgShape.propTypes);

    popupCloseIconButton.displayName = "PopupCloseIconButton";

    popupCloseIconButton.getSkinProperties = function getSkinProperties() {
        var refData = svgShape.getSkinProperties.apply(this, arguments);

        refData[''].onClick = onClick.bind(this);
        refData[''].style.cursor = 'pointer';

        return refData;
    };


    return popupCloseIconButton;
});
