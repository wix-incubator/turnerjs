define.Class('wysiwyg.editor.layoutalgorithms.LayoutAlgoModules', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize([
        'wysiwyg.editor.layoutalgorithms.TextLayoutCalculator',
        'wysiwyg.editor.layoutalgorithms.MultiLayoutComponentPropertyHandler',
        'wysiwyg.editor.layoutalgorithms.MultiLayoutComponentTextMigrationHandler',
        'wysiwyg.editor.layoutalgorithms.LayoutAlgoUtils',
        'wysiwyg.editor.layoutalgorithms.MobileOnlyComponentsHandler',
        'wysiwyg.editor.layoutalgorithms.LayoutAlgoConfig',
        'wysiwyg.editor.layoutalgorithms.AnchorsCalculator',
        'wysiwyg.editor.layoutalgorithms.StructuresComparer',
        'wysiwyg.editor.layoutalgorithms.subprocesses.StructurePreprocessor',
        'wysiwyg.editor.layoutalgorithms.subprocesses.StructureAnalyzer',
        'wysiwyg.editor.layoutalgorithms.subprocesses.StructureConverter',
        'wysiwyg.editor.layoutalgorithms.subprocesses.VirtualGroupHandler',
        'wysiwyg.editor.layoutalgorithms.mainalgorithms.ConversionAlgorithm',
        'wysiwyg.editor.layoutalgorithms.mainalgorithms.MergeAlgorithm'
    ]);

    def.methods({

        initialize: function(onPreviewManagerDependantModulesInitializedCallback) {
            this.$config = new this.imports.LayoutAlgoConfig(this);
            this.$utils = new this.imports.LayoutAlgoUtils(this);
            this.$textLayoutCalculator = new this.imports.TextLayoutCalculator(this);
            this.$mobileOnlyComponentsHandler = new this.imports.MobileOnlyComponentsHandler(this);
            this.$anchorsCalculator = new this.imports.AnchorsCalculator(this);
            this.$virtualGroupHandler = new this.imports.VirtualGroupHandler(this);
            this.$structuresComparer = new this.imports.StructuresComparer(this);
            this.$structureAnalyzer = new this.imports.StructureAnalyzer(this);
            this.$structureConverter = new this.imports.StructureConverter(this);

            resource.getResourceValue('W.Preview', function(preview){
                preview.getPreviewManagersAsync(function(previewManagers){
                    this.$multiLayoutComponentPropertyHandler = new this.imports.MultiLayoutComponentPropertyHandler(previewManagers, this);
                    this.$multiLayoutTextMigrationHandler = new this.imports.MultiLayoutComponentTextMigrationHandler(previewManagers, this);
                    this.$structurePreprocessor = new this.imports.StructurePreprocessor(this);
                    this.$conversionAlgorithm = new this.imports.ConversionAlgorithm(this);
                    this.$mergeAlgorithm = new this.imports.MergeAlgorithm(this);

                    onPreviewManagerDependantModulesInitializedCallback();

                }, this);
            }.bind(this));
        }
    });
});
