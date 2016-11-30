define.Class('wysiwyg.editor.layoutalgorithms.mainalgorithms.ConversionAlgorithm', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        initialize: function(modules) {
            this._utils = modules.$utils;
            this._config = modules.$config;
            this._structurePreprocessor = modules.$structurePreprocessor;
            this._structureAnalyzer = modules.$structureAnalyzer;
            this._virtualGroupHandler = modules.$virtualGroupHandler;
            this._structureConverter = modules.$structureConverter;
            this._anchorsCalculator = modules.$anchorsCalculator;
            this._mobileOnlyComponentsHandler = modules.$mobileOnlyComponentsHandler;

        },

        runMobileConversionAlgorithm: function(structure, deletedComponentIdList) {
            deletedComponentIdList = deletedComponentIdList || [];
            this._structurePreprocessor.preProcessStructure(structure, deletedComponentIdList);
            this._virtualGroupHandler.addVirtualGroupsToStructure(structure);
            this._structureAnalyzer.analyzeStructure(structure);
            this._structureConverter.convertStructure(structure);
            this._postProcessStructure(structure);
        },

        _postProcessStructure: function(structure) {
            this._virtualGroupHandler.replaceBackGroupsToFlatComponents(structure);
            this._mobileOnlyComponentsHandler.addMobileOnlyComponentsOnConversion(structure);
            this._config.activateExtraOperationsForComponentClassName(structure);
            this._anchorsCalculator.updateAnchors(structure);
            this._structureAnalyzer.cleanUpAlgorithmProperties(structure);
        }
    });
});
