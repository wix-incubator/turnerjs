define.experiment.component('wysiwyg.editor.components.panels.SEOPanel.LinkWizardSeo', function(componentDefinition, experimentStartegy){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStartegy;

    def.methods({
        _openPromoteLink:function(){
            LOG.reportEvent(wixEvents.SEO_WIZARD_LINK);

            var url = 'http://www.wix.com/my-account/sites/' + window.editorModel.metaSiteId + '/seo?sitename=' + window.editorModel.metaSiteData.siteName;
            url = url.toLowerCase();
            window.open(url, '_blank');
        }
    });
});