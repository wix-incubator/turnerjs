define(['santaProps', 'lodash', 'core', 'siteButton', 'fileUploader/utils/uploadFilesToMediaPlatform'],
    function (santaProps, _, /** core */ core, siteButton, uploadFilesToMediaPlatform) {
    'use strict';

    var mixins = core.compMixins;
        var SantaTypes = santaProps.Types;

    /**
     * @class components.fileUploader
     * @extends {core.skinBasedComp}
     */

    return {
        displayName: 'FileUploader',

        statics: {
            useSantaTypes: true
        },

        propTypes: _.assign({
            metaSiteId: SantaTypes.RendererModel.metaSiteId.isRequired
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(siteButton)),

        mixins: [mixins.skinBasedComp],

        createChooseFileButton: function (fileInput) {
            var buttonData = {
                label: 'Choose File',
                id: 'choose-file-button'
            };

            var extraProps = {
                skinPart: 'chooseFileButton',
                compProps: {
                    align: 'center'
                },
                onClick: function () {
                    fileInput.click();
                }
            };

            return this.createChildComponent(buttonData, 'wysiwyg.viewer.components.SiteButton', 'siteButton', extraProps);
        },

        getSkinProperties: function () {
            var chooseFileButton = this.createChooseFileButton(this.refs.fileInput);

            return {
                '': {
                },
                'chooseFileButton': {
                    children: [chooseFileButton]
                },
                'fileInput': {
                    onChange: function () {
                        var file = this.refs.fileInput.files[0];
                        if (this.refs.fileName) {
                            this.refs.fileName.innerText = file.name;
                        }
                        uploadFilesToMediaPlatform.upload(file);
                    }.bind(this)
                }
            };
        }
    };
});
