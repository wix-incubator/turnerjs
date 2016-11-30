define.experiment.Class('wysiwyg.editor.managers.editormanager.WEditorManager.QualarooOldEditorSurvey', function (def, strategy) {

    def.methods({
        initialize: strategy.after(function(){
            // currently the survey is set to run after 15 minutes (trough the qualaroo site), we want it to be 1 hour.
            this.addEvent(this.EDITOR_READY, this._addSurveyScript);
        }),

        _addSurveyScript: function() {
            try {
                // Code given by Qualaroo
                var _kiq = _kiq || [];
                setTimeout(function(){
                    var d = document, f = d.getElementsByTagName('script')[0], s = d.createElement('script'); s.type = 'text/javascript';
                    s.async = true; s.src = '//s3.amazonaws.com/ki.js/59166/dei.js'; f.parentNode.insertBefore(s, f);
                }, 1000 * 60 * (60 - 15));
                _kiq.push(['identify', editorModel.userInfo && editorModel.userInfo.email]);
                // End of Qualaroo code
            }
            catch (err) {
                LOG.reportError(
                    wixErrors.QUALAROO_OLD_EDITOR_SURVEY_FAILED,
                    'wysiwyg.editor.managers.editormanager.WEditorManager.QualarooOldEditorSurvey',
                    '_addSurveyScript',
                    err.stack || ''
                );
            }
        }
    });
});

