define(['lodash', 'core', 'components/components/dialogs/dialogMixin', 'experiment'], function (_, /** core */ core, dialogMixin, experiment) {
    'use strict';

    /**
     * @class components.dialogs.NotificationDialog
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: "NotificationDialog",
        mixins: [core.compMixins.skinBasedComp, dialogMixin],

        getSkinProperties: function () {

            if (this.shouldDialogBeClosed()) {
                return this.getCloseDialogSkinProperties();
            }

            var title = _.isUndefined(this.props.title) ? '=title missing=' : this.props.title;
            var description = _.isUndefined(this.props.description) ? '=description missing=' : this.props.description;
            var getButtonText = function (key) {
                return this.props.buttonText || this.getText(this.props.language, key);
            }.bind(this);

            var isNewLoginScreens = experiment.isOpen('newLoginScreens');
            var skin = {
                "blockingLayer": isNewLoginScreens ? {} : {onClick: this.closeDialog},
                "dialogTitle": {
                    children: title
                },
                "dialogDescription": {
                    children: description
                },
                "xButton": this.createXButton()
            };
            
            var extraSkinParams;
            if (isNewLoginScreens) {
                extraSkinParams = {
                    "dialogTitle": {
                        children: title
                    },
                    "dialogDescription": {
                        children: description,
                        className : this.props.description ? '' : this.props.styleId + '_noDialogDescription'
                    },
                    "okButton": {
                        children: this.createSubmitButton('okButton', getButtonText('SMRegister_GO')),
                        onClick: this.props.onButtonClick || this.closeDialog
                    }
                };
            } else {
                extraSkinParams = {
                    "okButton": {
                        children: getButtonText('SMRegister_OK'),
                        onClick: this.props.onButtonClick || this.closeDialog
                    }
                };
            }
            _.merge(skin, extraSkinParams);


            return skin;
        }
    };
});
