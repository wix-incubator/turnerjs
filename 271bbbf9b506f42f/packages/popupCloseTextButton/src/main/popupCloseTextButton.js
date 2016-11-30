define(['lodash', 'santaProps', 'siteButton'], function (_, santaProps, siteButton) {
    'use strict';

    /**
     * @class components.PopupCloseTextButton
     * @extends {components.siteButton}
     */

    var popupCloseTextButton = _.cloneDeep(siteButton);

    popupCloseTextButton.displayName = "PopupCloseTextButton";

    popupCloseTextButton.propTypes = _.defaults({
        closePopupPage: santaProps.Types.popup.close
    }, siteButton.propTypes);

    popupCloseTextButton.getSkinProperties = function () {
        var refData = siteButton.getSkinProperties.apply(this, arguments);

        refData[''].onClick = function () {
            var link = this.props.compData.link;

            if (!link ||
                link.type === 'DocumentLink' ||
                link.type === 'ExternalLink' ||
                link.type === 'PhoneLink' ||
                link.type === 'EmailLink'
            ) {
                this.props.closePopupPage();
            }
        };

        return refData;
    };

    return popupCloseTextButton;
});
