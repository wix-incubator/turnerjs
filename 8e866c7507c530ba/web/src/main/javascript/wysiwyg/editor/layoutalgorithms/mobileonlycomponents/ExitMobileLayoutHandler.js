define.Class('wysiwyg.editor.layoutalgorithms.mobileonlycomponents.ExitMobileLayoutHandler', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Resources']);

    def.statics({
        DEFAULT_CONTAINER_ID: 'SITE_FOOTER',
        ADD_BY_DEFAULT: false,
        ON_HIDDEN_LIST_WHEN_NOT_EXIST: false,
        IS_SINGLETON: true,
        COMPONENT_ID: "EXIT_MOBILE",
        DATA_QUERY: null,
        COMPONENT_TYPE: "wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode",
        DEFAULT_SKIN: "wysiwyg.common.components.exitmobilemode.viewer.skins.ExitMobileModeSkin",
        DEFAULT_STYLE_ID: "emb1",
        TYPE: "Component"
    });

    def.inherits('wysiwyg.editor.layoutalgorithms.mobileonlycomponents.MobileOnlyComponentLayoutHandler');

    def.methods({

        initialize: function(modules) {
            this.parent(modules);
            this._modules = modules;
        },


        getDefaultLayout: function() {
            return {
                height: 30,
                width: this._config.MOBILE_WIDTH - (2*this._config.SITE_SEGMENT_PADDING_X),
                x: this._config.SITE_SEGMENT_PADDING_X,
                y: 0
            };
        },

        getReservedSpace: function() {
            return null;
        },

        getAdditionalStyles: function() {
            return {};
        },

        //new
        addToStructure: function (structure) {
            var dataRef = this._createExitMobileDataItem();
            var compData = this._getExitMobileComponentData(dataRef);
            var siteFooter = this._utils.getComponentByIdFromStructure(this.getDefaultContainerId(), structure);
            var prevComp = this._getLowestComponentInFooter(siteFooter);

            this._modules.$structureAnalyzer.identifyBlocks(structure);
            this._modules.$mergeAlgorithm.insertAddedComponentBetweenBlocks(siteFooter, compData, prevComp ? prevComp.id : null);
            this._modules.$anchorsCalculator.updateAnchorsAfterMerge(structure, [], [this.getComponentId()]);
            this._modules.$structureAnalyzer.cleanUpAlgorithmProperties(structure);
        },

        _createExitMobileDataItem: function () {
            var dataManager = W.Preview.getPreviewManagers().Data;
            var data = {
                'type': 'LinkableButton',
                'label': this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ExitMobileMode_DEFAULT_LABEL'),
                'linkType': 'FREE_LINK',
                'text': this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ExitMobileMode_DEFAULT_LABEL'),
                'target': '_blank',
                'icon': ''
            };
            var dataRef = dataManager.addDataItemWithUniqueId('EXIT_MOBILE', data);
            dataRef.dataObject.setIsPersistent(true);
            return dataRef;
        },

        _getExitMobileComponentData: function (dataRef) {
            var compData = this.getComponentDefaultData();
            var dataQuery = "#" + dataRef.id;
            compData.dataQuery = dataQuery;
            return compData;
        },

        _getLowestComponentInFooter: function (siteFooter) {
            var prevComp;
            if (siteFooter.components.length > 0) {
                prevComp = _.max(siteFooter.components, function (comp) {
                    return comp.layout.y + comp.layout.height;
                });
            }
            else {
                prevComp = null;
            }
            return prevComp;
        }



    });
});
